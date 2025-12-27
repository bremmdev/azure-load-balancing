import { NavLink, Link } from "react-router";

export default function Header() {
  return (
    <header className="text-white bg-primary-teal flex justify-between items-center p-4 md:px-8">
      <Link to="/" className="text-2xl font-medium -translate-y-1" viewTransition>
        <span className="text-teal-200">mem</span>caydia
      </Link>
      <nav>
        <ul className="uppercase font-medium">
          <li>
            <NavLink to="/highscores" className={({isActive}) => isActive ? "text-teal-200" : "hover:text-teal-200"} viewTransition>
              highscores
            </NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
}
