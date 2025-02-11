import axios from 'axios';

export class SymantoService {
  rapidApiKey = process.env.RAPIDAPI_API_KEY;
  rapidApiEndpoint = process.env.RAPIDAPI_ENDPOINT;
  rapidApiHost = process.env.RAPIDAPI_HOST;

  traitMap = {
    intellectual: ['Openness'],
    imaginative: ['Openness'],
    artistic: ['Openness'],
    adventurous: ['Openness'],
    authority_challenging: ['Openness'],
    excitement_seeking: ['Openness', 'Extraversion'],
    emotionally_aware: ['Openness'],
    disciplined: ['Conscientiousness'],
    achievement_striving: ['Conscientiousness'],
    self_efficacy: ['Conscientiousness'],
    cautious: ['Conscientiousness'],
    orderliness: ['Conscientiousness'],
    dutiful: ['Conscientiousness'],
    outgoing: ['Extraversion'],
    gregariousness: ['Extraversion'],
    assertive: ['Extraversion'],
    cheerful: ['Extraversion'],
    extraversion: ['Extraversion'],
    trusting: ['Agreeableness'],
    altruism: ['Agreeableness'],
    cooperative: ['Agreeableness'],
    sympathy: ['Agreeableness'],
    agreeableness: ['Agreeableness'],
    uncompromising: ['Agreeableness'],
    modesty: ['Agreeableness'],
    immoderation: ['Neuroticism'],
    fiery: ['Neuroticism'],
    stress_prone: ['Neuroticism'],
    neuroticism: ['Neuroticism'],
    melancholy: ['Neuroticism'],
    self_conscious: ['Neuroticism'],
  };

  async getBig5(text: string): Promise<Record<string, number> | { error: string }> {
    try {
      const options = {
        method: 'POST',
        url: this.rapidApiEndpoint,
        headers: {
          'content-type': 'application/json',
          'x-rapidapi-key': this.rapidApiKey,
          'x-rapidapi-host': this.rapidApiHost,
        },
        data: [
          {
            id: '1',
            language: 'en',
            text,
          },
        ],
      };

      const response = await axios.request(options);

      return this.getAspectPercentages(response.data);
    } catch (error) {
      console.log(error);
      return { error: error.message };
    }
  }

  getAspectPercentages(data: Record<string, number>[]): Record<string, number> {
    const aspects = {
      Openness: 0,
      Conscientiousness: 0,
      Extraversion: 0,
      Agreeableness: 0,
      Neuroticism: 0,
    };

    for (const [trait, score] of Object.entries(data[0])) {
      if (this.traitMap.hasOwnProperty(trait)) {
        this.traitMap[trait].forEach((aspect: string) => {
          aspects[aspect] += score;
        });
      }
    }

    for (const [aspect, score] of Object.entries(aspects)) {
      if (['Openness', 'Agreeableness'].includes(aspect)) {
        aspects[aspect] = Math.round((score / 7) * 100);
      } else {
        aspects[aspect] = Math.round((score / 6) * 100);
      }
    }
    return aspects;
  }
}
