import { Link, useLocation, useRouteError } from "react-router";
import Container from "@/components/layout/Container";
import Header from "@/components/layout/Header";
import { MoveLeft } from "lucide-react";

export default function ErrorPage() {
  const error = useRouteError() as Error;
  const location = useLocation();

  const title = location.pathname.includes("/games") ? "Game" : "Highscores";

  return (
    <>
      <Header />

      <main>
        <Container>
          <div className="max-sm:-mt-6 flex-column sm:flex-row justify-center items-center relative">
            <Link
              to="/"
              className="sm:absolute sm:left-0 flex text-primary-teal justify-center gap-2 items-center border border-primary-teal px-4 py-2 w-fit rounded-md font-medium uppercase hover:bg-primary-teal/10"
              viewTransition
            >
              <MoveLeft className="size-5" />
              Back
            </Link>
            <h1 className="max-sm:mt-6 w-fit mx-auto sm:translate-y-1.5 text-2xl sm:text-3xl tracking-wide font-bold text-center text-primary-teal">
              {title}
            </h1>
          </div>
          <p className="text-rose-600 text-center font-bold">{error.message}</p>
        </Container>
      </main>
    </>
  );
}
