import { CheckCircle } from "lucide-react";

export default function ThankYouPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="flex flex-col items-center gap-4">
        <CheckCircle className="h-16 w-16 text-green-500" />
        <h1 className="text-2xl font-bold">Thank You for Your Purchase!</h1>
        <p className="text-center text-gray-700">
          We appreciate your business and hope you enjoy your credits and
          minutes.
        </p>
        <a href="/" className="mt-4 text-blue-500 underline">
          Return to Home
        </a>
      </div>
    </div>
  );
}
