import { Link } from "react-router";
import Container from "../layout/Container";
import NotFoundImg from "@/assets/not-found.webp";

export default function NotFound() {
  return (
    <Container>
      <h1 className="max-sm:mt-6 w-fit mx-auto sm:translate-y-1.5 text-2xl sm:text-3xl tracking-wide font-bold text-center text-primary-teal">
        Page not found
      </h1>
      <img src={NotFoundImg} alt="404" className="w-5/6 max-w-lg mx-auto" />
      <Link
        to="/"
        className="text-white flex justify-center gap-2 items-center bg-primary-teal px-4 py-2 w-fit rounded-md font-medium uppercase hover:bg-opacity-90 mx-auto"
        viewTransition
      >
        Home
      </Link>
    </Container>
  );
}
