'use client';

import { Button, ButtonType } from '@/lib/components/Button';
import { apiClient } from '@/lib/clients/apiClient';
import { LS_APP_PAGE_TOAST } from '@/lib/constants';
import { useAuthForm } from '@/lib/hooks/useAuthForm';
import { Toast } from '@/lib/hooks/useToast';
import { useApp } from '@/lib/providers/AppProvider';
import { AuthService } from '@/lib/services/AuthService';
import { TextInput } from '@/lib/components/TextInput';
import { modViewport, usePressEnterFor } from '@/lib/util';
import { LayoutGroup, motion } from 'framer-motion';
import { useLayoutEffect, useState } from 'react';

export default function Page() {
  const { setToast, setUser } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistration, setIsRegistration] = useState(false);

  useLayoutEffect(() => {
    if (isInValidationMode) {
      setErrors({});
      setIsInValidationMode(false);
    }

    const clearMods: VoidFunction = modViewport();

    return () => {
      setToast(null);
      clearMods();
    };
  }, [isRegistration]);

  const loginAction = async () => {
    try {
      await apiClient.post('/login', form).then(async (res: any) => {
        const cookies = document.cookie.split(';');
        const authCookie = cookies.find((cookie) => cookie.trim().startsWith('otAuthToken='));
        const token = authCookie ? authCookie.split('=')[1] : null;
        if (token) {
          AuthService.setSessionToken(token);
          setUser(res.data.user);
          setToast({ message: 'Welcome!', type: 'success' }, LS_APP_PAGE_TOAST);
          window.location.replace('/');
        }
      });
    } catch (err: any) {
      setToast({
        type: 'error',
        message: err?.response?.status === 403 ? 'Incorrect email or password' : 'Unknown error occurred',
      });
      setIsLoading(false);
      return;
    }
  };

  const onSubmit = async () => {
    setIsLoading(true);

    if (isRegistration) {
      try {
        await apiClient.post('/register', form).then(async () => {
          await loginAction();
        });
      } catch (err: any) {
        console.log(err);
        const toast: Toast =
          err?.response?.status === 409
            ? { type: 'info', message: 'Email in use. Please log in.' }
            : { type: 'error', message: 'Something went wrong. Please try again later.' };

        setToast(toast);
        setIsLoading(false);
        return;
      }
    } else {
      await loginAction();
    }
  };

  const { form, setForm, errors, setErrors, setIsInValidationMode, isInValidationMode, handleSubmit } =
    useAuthForm(onSubmit, isRegistration);

  usePressEnterFor(onSubmit, form);

  return (
    <div
      key={`auth-page-ui`}
      className={`relative -top-20 flex w-full flex-col items-center justify-center p-3 md:my-auto md:max-h-[62dvh]`}
    >
      <div
        className={`font-outline-dark fixed top-12 mx-auto rounded-[10px] border-2 border-accent bg-white bg-opacity-20 px-8 py-1.5 text-center font-jersey text-4xl text-accent`}
      >
        Project Gutenberg
        <br />
        Explorer
      </div>

      <div className={`flex w-[400px] flex-row justify-end pb-2 will-change-transform`}>
        <Button
          type={ButtonType.LINK}
          onClick={() => setIsRegistration(!isRegistration)}
          text={isRegistration ? 'Back to Log In' : 'Sign Up'}
          className={`text-md will-change-contents`}
        />
      </div>

      <LayoutGroup>
        <div className={`flex-page-full flex-col`}>
          <motion.div layout className={'flex-page-full justify-between gap-y-6 md:justify-start'}>
            <motion.div layout className={`flex w-[400px] flex-col items-start gap-y-6`}>
              {isRegistration ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, opacity: { duration: 1, delay: 0.5 } }}
                  className={`flex w-full flex-col items-start gap-y-6`}
                >
                  <TextInput
                    name={`firstName`}
                    placeholder={'First Name'}
                    value={form.firstName}
                    onChange={(e: any) => setForm({ ...form, firstName: e.target.value })}
                    invalid={errors.firstName}
                  />

                  <TextInput
                    name={`lastName`}
                    placeholder={'Last Name'}
                    value={form.lastName}
                    onChange={(e: any) => setForm({ ...form, lastName: e.target.value })}
                    invalid={errors.lastName}
                  />

                  {/*<TextInput*/}
                  {/*  name={`phone`}*/}
                  {/*  type={`tel`}*/}
                  {/*  placeholder={'Phone Number'}*/}
                  {/*  autoCompleteType={`tel`}*/}
                  {/*  onChange={(e: any) => setForm({ ...form, phone: e.target.value })}*/}
                  {/*  value={form.phone}*/}
                  {/*  invalid={errors.phone}*/}
                  {/*  invalidMessage={`Phone must be 16 characters or less.`}*/}
                  {/*  disclaimer={`This field is required`}*/}
                  {/*/>*/}
                </motion.div>
              ) : null}

              <TextInput
                name={`email`}
                placeholder={'Email Address'}
                onChange={(e: any) => setForm({ ...form, email: e.target.value })}
                value={form.email}
                invalid={errors.email}
              />

              <LayoutGroup>
                <TextInput
                  name={`password`}
                  placeholder={'Password'}
                  value={form.password}
                  onChange={(e: any) => setForm({ ...form, password: e.target.value })}
                  invalid={errors.password}
                  className={`anchor-root`}
                />
              </LayoutGroup>
            </motion.div>

            <div className={`flex flex-col items-center justify-center`}>
              <Button
                onClick={handleSubmit}
                type={ButtonType.PRIMARY}
                loading={{ state: isLoading, content: isRegistration ? 'Registering...' : 'Signing In...' }}
                text={isRegistration ? 'Sign Up' : 'Log In'}
                className={`w-[210px] will-change-transform ${isRegistration ? `mt-12` : `mt-20`}`}
              />
            </div>
          </motion.div>
        </div>
      </LayoutGroup>
    </div>
  );
}
