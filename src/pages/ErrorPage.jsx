import React from 'react';
import { useParams } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';


const ErrorPage = () => {
  const { status } = useParams();
  let title = 'Error';
  let message = 'An unexpected error occurred. Please try again later.';

  switch (status) {
    case '404':
      title = 'Page Not Found';
      message = 'The page you are looking for does not exist. Please check the URL or return to the homepage.';
      break;
    case '400':
      title = 'Bad Request';
      message = 'The request was invalid. Please check your input and try again.';
      break;
    case '401':
      title = 'Unauthorized';
      message = 'You are not authorized to access this page. Please log in or contact support.';
      break;
    default:
      title = 'Error';
      message = `An error occurred (Status: ${status}). Please try again later or contact support.`;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md p-6 text-center">
        <h1 className="text-3xl font-bold text-text-primary mb-4">{title}</h1>
        <p className="text-text-secondary mb-6">{message}</p>
        <Button
          variant="primary"
          onClick={() => window.location.href = '/'}
          className="px-4 py-2"
        >
          Go to Homepage
        </Button>
      </Card>
    </div>
  );
};

export default ErrorPage;