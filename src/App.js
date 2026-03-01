import { useEffect, useState } from "react";

const tempMovieData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
  },
  {
    imdbID: "tt0133093",
    Title: "The Matrix",
    Year: "1999",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
  },
  {
    imdbID: "tt6751668",
    Title: "Parasite",
    Year: "2019",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
  },
];

const tempWatchedData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    runtime: 148,
    imdbRating: 8.8,
    userRating: 10,
  },
  {
    imdbID: "tt0088763",
    Title: "Back to the Future",
    Year: "1985",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
    runtime: 116,
    imdbRating: 8.5,
    userRating: 9,
  },
];

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "20de2ed1";
// Structural component
export default function App() {
  const [movies, setMovies] = useState(tempMovieData);
  const [watched, setWatched] = useState(tempWatchedData);
  const [isLoading, SetIsLoading] = useState(false);
  const query = "game";

  // this will load after the component has been painted on screen
  useEffect(function () {
    async function fetchMovies() {
      SetIsLoading(true);
      const res = await fetch(
        `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
      );
      // this is side effect
      const data = await res.json();
      setMovies(data.Search);
      SetIsLoading(false);
      // console.log(data.Search);
    }
    fetchMovies();
    // .then((res) => res.json())
    // .then((data) => setMovies(data.Search));
    // if there is setstate in render logic it will trigger the state infinite times
  }, []);
  // [] dependencies arrys-> it will work ehn component is mounted
  // effect cant return promise so cant use async in effect directly so create a function adn indirectly add it
  return (
    <>
      <NavBar>
        <Search />
        <NumResult movies={movies} />
      </NavBar>

      <Main>
        {/* <Box element={<MovieList movies={movies} />} />
        <Box
          element={
            <>
              <Summary watched={watched} />
              <WatchedMovieList watched={watched} />
            </>
          }
        /> */}
        <Box>{isLoading ? <Loader /> : <MovieList movies={movies} />}</Box>
        <Box>
          <Summary watched={watched} />
          <WatchedMovieList watched={watched} />
        </Box>
        {/* <WatchedBox /> */}
      </Main>
    </>
  );
}
function Loader() {
  return <p className="loader">Loading...</p>;
}
function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

// function Box({ children }) {
//   const [isOpen, setIsOpen] = useState(true);

//   return (
//     <div className="box">
//       <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
//         {isOpen ? "–" : "+"}
//       </button>
//       {isOpen && children}
//     </div>
//   );
// }

// function WatchedBox() {
//   const [watched, setWatched] = useState(tempWatchedData);
//   const [isOpen2, setIsOpen2] = useState(true);

//   return (
//     <div className="box">
//       <button
//         className="btn-toggle"
//         onClick={() => setIsOpen2((open) => !open)}
//       >
//         {isOpen2 ? "–" : "+"}
//       </button>
//       {isOpen2 && (
//         <>
//           <Summary watched={watched} />
//           <WatchedMovieList watched={watched} />
//         </>
//       )}
//     </div>
//   );
// }

function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}

function NumResult({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

// presentational component
function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

// stateful component
function Search() {
  const [query, setQuery] = useState("");
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}

// structural
function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Movie({ movie }) {
  return (
    <li>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

// stateful
function MovieList({ movies }) {
  return (
    <ul className="list">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} />
      ))}
    </ul>
  );
}

function WatchedMovieList({ watched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie movie={movie} key={movie.imdbID} />
      ))}
    </ul>
  );
}
function WatchedMovie({ movie }) {
  return (
    <li>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
      </div>
    </li>
  );
}

function Summary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

/**
 * HOW TO SPLIT UI IN COMPONENTS
 * -> Huge component
 * - too many responsibility
 * - might need too many props
 * - hard to reuse
 * - complex code,hard to undersatnd
 *
 * -> Small component
 * - we will end up with 100s of mini components
 * - confusing codebase
 * - too abstracted
 *
 * ->how to split
 * - logical seperation
 * - some are reusable
 * - low complexity
 *
 * -> 4 critrtia
 * 1. logical seperated of content/layout
 * - does the conmponent contain peices of content or layout that dont't belong together?
 * - is it possible to reuse part of this component?
 * - do you want/need to reuse it?
 * - is the component doing too many different things?
 * - does the component reply on too many props?
 * - does the component have too many peice of state and/or effect?
 * - is the ocde ,including JSX ,too complex/confusing?
 * - do you prefer smaller function/components?
 * - If yes then you need a new component
 *
 * 2. reusability
 * 3. responsibilities/complexity
 * 4. personal coding style
 *
 */

/**
 * GENERAL GUIDELINES
 * -> creating new component creates a new abstraction
 * -> name the component according to what it does or what it displays
 * -> never declare a new component inside another component
 * -> co-locate related components inside same file
 */

/**
 * Component categories
 * -> stateless/presentational component
 * - no state
 * -receive prop and simpley present received data or other content
 * - usually small and reusable
 * -> stateful component
 * - have state
 * - can be reusable
 * -> structural component
 * - Pages, Layouts Screen or app
 * - esult of composition
 * - can be huge and non-reusable
 * - provide structure
 */

/**
 * COMPONENT COMPOSITION
 * -> using a component inside a compoent dont let it to be reused
 * -> in component composition we pass children as a prop and now the component is reusable too
 * -> component composition is combining different compoent using the children prop (or explicitly defined props)
 * ->WE use component composition in 2 cases
 * - create highly reusable and flexible components
 * - fix a prop drilling (great for layouts)
 * - [possible because components dont need to know their children in advance]
 */

/**
 * Component(instance) lifecycle
 * 1. Mounted/Initial render
 * - component instance is rendered for the first time
 * - fresh state and prop are created
 * 2. re-rendered(unlimited times)
 * - state change
 * - prop change
 * - parent change
 * - context change
 * 3. unmounted
 * - component instance is destoyed and removed
 * - state and prop are destroyed
 */

/**
 * A First look at effect
 * -> Side effect is basically any interaction between a react component and the world outside the compnent
 * -> side effect should not happend in render logic
 * -> side effect can be implement by event handlers(function triggered) and effect(useEffect) - Effect allow us to write code that will run at different moment:Mount re-ender or un-mount
 */

/**
 * Event handler
 * - executed when the corresponding event happens
 * - use to react to an event
 * - preferred way to create side effects
 * Effect
 * - executed after the component mount(initial mount) and after subsequent re-render(accourding to dependency array)
 * - each one has Effect code + Cleanup function + dependency array
 * - used to keep a component synchronized with some external system
 * */
