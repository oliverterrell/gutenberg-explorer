import { PutObjectCommand } from '@aws-sdk/client-s3';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { google } from '@google-cloud/text-to-speech/build/protos/protos';
import { s3 } from '@/server/clients/s3Client';
import AudioEncoding = google.cloud.texttospeech.v1.AudioEncoding;

const ttsClient = new TextToSpeechClient();

export class TtsService {
  private currentRequestId: string | null = null;
  private Bucket: string = process.env.AWS_S3_BUCKET;
  private abortController: AbortController | null = null;

  private async synthesize(text: string, voice: string, requestId: string): Promise<any> {
    const request = {
      input: { text },
      voice: { languageCode: 'en-US', name: voice },
      audioConfig: { audioEncoding: AudioEncoding.LINEAR16 },
    };

    if (requestId !== this.currentRequestId) {
      return null;
    }

    this.abortController = new AbortController();
    const signal = this.abortController.signal;

    try {
      const synthesizePromise = ttsClient.synthesizeSpeech(request);
      const timeoutPromise = new Promise((_, reject) => {
        signal.addEventListener('abort', () => reject(new Error('Synthesis aborted')));
      });

      const [response] = (await Promise.race([synthesizePromise, timeoutPromise])) as any;

      if (requestId !== this.currentRequestId) {
        return null;
      }

      return { audioContent: response.audioContent as Buffer, reqId: requestId };
    } finally {
      this.abortController = null;
    }
  }

  private async uploadToS3(audioContent: Buffer, Key: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.Bucket,
      Key,
      Body: audioContent,
      ContentType: 'audio/mpeg',
      Metadata: {
        'Cache-Control': 'no-store,no-cache,must-revalidate,max-age=0',
        'Last-Modified': Date.now().toString(),
        Expires: '0',
      },
    });

    await s3.send(command);

    return `https://${this.Bucket}.s3.amazonaws.com/${Key}`;
  }

  private cancelCurrentOperation() {
    if (this.abortController) {
      this.abortController.abort();
    }
    this.abortController = null;
    this.currentRequestId = null;
  }

  public async handleTtsRequest(req: any, res: any) {
    const { text, requestId, voice = 'en-US-Journey-F' } = req.body;

    if (this.currentRequestId) {
      this.cancelCurrentOperation();
    }

    this.currentRequestId = requestId;

    try {
      const result = text ? await this.synthesize(text, voice, requestId) : null;

      if (!result || result.reqId !== this.currentRequestId) {
        return res.status(200).json({ success: false, requestId });
      }

      const Key = `${req.user.id}_${requestId}.mp3`;

      await this.uploadToS3(result.audioContent, Key);

      res.status(200).json({
        url: `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${Key}`,
        Bucket: this.Bucket,
        Key,
        success: true,
        requestId: requestId,
      });
    } catch (error) {
      if (error.message === 'Synthesis aborted') {
        return res.status(200).json({ success: false, requestId });
      }
      if (!res.headersSent) {
        // next(error);
      }
    } finally {
      if (this.currentRequestId === requestId) {
        this.abortController = null;
        this.currentRequestId = null;
      }
    }
  }
}
