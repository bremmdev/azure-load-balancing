import Hero from "@/components/layout/Hero";
import Container from "@/components/layout/Container";
export default function IndexRouteError() {
  return (
    <>
      <Hero />
      <Container>
        <section className="space-y-12 md:space-y-16">
          <h2 className="text-xl sm:text-3xl text-primary-teal tracking-wide font-bold text-center leading-tight max-w-2xl mx-auto">
            Enhance your brain health through fun and engaging memory games
          </h2>
          <p className="text-rose-600 text-center font-bold">Could not fetch games</p>
        </section>
      </Container>
    </>
  );
}
