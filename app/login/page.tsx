'use client';

import React, {useEffect} from 'react';
import {useRouter} from 'next/navigation';
import {useAuth} from '../context/AuthContext';
import {useFormState, useFormStatus} from 'react-dom';
import Form from "next/form";

// Login Submit Button with loading state
function SubmitButton() {
  const {pending} = useFormStatus();

  return (
      <button
          type="submit"
          className="btn btn-primary"
          disabled={pending}
      >
        {pending ? 'Logging in...' : 'Login'}
      </button>
  );
}

// Initial state
const initialState = {
  error: '',
};

export default function LoginPage() {
  const {login, user} = useAuth();
  const router = useRouter();

  // Form action function
  const loginAction = async (prevState: typeof initialState, formData: FormData) => {
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    if (!username || !password) {
      return {error: 'Username and password are required'};
    }

    try {
      await login(username, password);
      return {error: ''};
    } catch (err) {
      return {error: 'Invalid username or password'};
    }
  };

  // Form state using useFormState
  const [state, formAction] = useFormState(loginAction, initialState);

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  // If login was successful and error is cleared, redirect
  useEffect(() => {
    if (user && !state.error) {
      router.push('/');
    }
  }, [user, state.error, router]);

  return (
      <div className="container">
        <div className="login-form card">
          <h1>Login to Podcast Manager</h1>

          {state.error && (
              <div style={{color: 'var(--danger-color)', marginBottom: '1rem'}}>
                {state.error}
              </div>
          )}

          <Form action={formAction}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                  type="text"
                  id="username"
                  name="username"
                  className="form-control"
                  required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                  type="password"
                  id="password"
                  name="password"
                  className="form-control"
                  required
              />
            </div>

            <SubmitButton/>
          </Form>
        </div>
      </div>
  );
}
