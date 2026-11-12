import Card from "./Card";

export default function HomeGrid({ cards, covers }) {
  if (!cards || cards.length === 0) return null;

  return (
    <div className="home-grid">
      {cards.map((c) => (
        <Card key={c.id} c={c} cover={covers ? covers[c.id] : undefined} />
      ))}
    </div>
  );
}