import React from "react";

export default function Form002({ subheading, heading, text, ...props }) {
  return (
    <section className="py-6 md:py-8 lg:py-12 xl:py-20" {...props}>
      <div className="container mx-auto">
        <div className="flex flex-col justify-center items-center text-center">
          {subheading && (
            <p className="text-primary uppercase m-0">
              {subheading}
            </p>
          )}
          {heading && (
            <h1 className="font-extrabold leading-tight text-4xl md:text-5xl lg:text-6xl">
              {heading}
            </h1>
          )}
          {text && (
            <p className="mt-2 text-lg">
              {text}
            </p>
          )}
          <div className="flex justify-center align-center text-center">
          <form className="grid grid-cols-1 ml-40  md:grid-cols-2 mt-6 gap-1 text-center md:w-auto">
            <label htmlFor="email" className="sr-only">
              Email
            </label>
            <input
              type="email"
              id="form-002-email"
              name="email"
              placeholder="Type your email"
              className="p-2 border border-gray-300 rounded-md w-[300px]"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white p-2 w-[100px] rounded-md hover:bg-blue-700"
            >
              Request
            </button>
          </form>
          </div>
        </div>
      </div>
    </section>
  );
}
