import Hero from "@/components/layout/Hero";
import GamesList from "@/components/games/GamesList";
import Container from "@/components/layout/Container";
import useDocumentTitle from "@/hooks/useDocumentTitle";

export default function IndexPage() {
  useDocumentTitle("Memcaydia", true);

  return (
    <>
      <Hero />
      <Container>
        <GamesList />
      </Container>
    </>
  );
}
