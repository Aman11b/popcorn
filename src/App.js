import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";
import { useMovie } from "./useMovie";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "20de2ed1";
// Structural component
export default function App() {
  const [query, setQuery] = useState("1988");
  const [selectedId, setSelectedId] = useState(null);
  const { movies, isLoading, error } = useMovie(query, handleCloseMovie);

  // const [watched, setWatched] = useState([]);
  const [watched, setWatched] = useState(function () {
    const storedValue = localStorage.getItem("watched");
    return JSON.parse(storedValue);
  });
  function handleSelectMovie(id) {
    setSelectedId((selectedId) => (id === selectedId ? null : id));
  }
  function handleCloseMovie() {
    setSelectedId(null);
  }
  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie]);

    // localStorage.setItem("watched", JSON.stringify([...watched, movie]));
  }
  function handleDeleteWatched(id) {
    setWatched((watched) => watched.filter((movies) => movies.imdbID !== id));
  }

  useEffect(
    function () {
      localStorage.setItem("watched", JSON.stringify(watched));
    },
    [watched],
  );

  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery} />
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
        <Box>
          {/* {isLoading ? <Loader /> : <MovieList movies={movies} />} */}
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <MovieList
              movies={movies}
              onSelectMovie={handleSelectMovie}
              onCloseMovie={handleCloseMovie}
            />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>
        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              onCloseMovie={handleCloseMovie}
              onAddWatched={handleAddWatched}
              watched={watched}
            />
          ) : (
            <>
              <Summary watched={watched} />
              <WatchedMovieList
                watched={watched}
                onDeleteWatched={handleDeleteWatched}
              />
            </>
          )}
        </Box>
        {/* <WatchedBox /> */}
      </Main>
    </>
  );
}
function Loader() {
  return <p className="loader">Loading...</p>;
}
function ErrorMessage({ message }) {
  return <p className="error">{message}</p>;
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
function Search({ query, setQuery }) {
  // this is not react way to do things we want things declarative
  // useEffect(function () {
  //   const el = document.querySelector(".search");
  //   console.log(el);
  //   el.focus();
  // }, []);

  const inputEl = useRef(null);

  useEffect(
    function () {
      function callback(e) {
        if (document.activeElement === inputEl.current) return;
        if (e.code === "Enter") {
          inputEl.current.focus();
          setQuery("");
        }
      }
      document.addEventListener("keydown", callback);
      return () => document.addEventListener("keydown", callback);
    },
    [setQuery],
  );

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
    />
  );
}

/**
 * WHAT ARE REFS?
 * -> "BOX" (object) with a mutable .current property that is persistsed across renders("normal veriable are always reset")
 * -> we can write to and read from the ref using .current
 * -> Two big use cases
 * - creating a variable that stays the same between renders(eg previous stsate,setTimeout id etc..)
 * - selecting and storing DOM element
 * -> Refs are for data that is not rendered:usually only appear in event handlers or effect,not in JSX (otherwise use State)
 * -> Do not read or write .current in render logic(like state)
 */

// structural
function Main({ children }) {
  return <main className="main">{children}</main>;
}

// stateful
function MovieList({ movies, onSelectMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie} />
      ))}
    </ul>
  );
}

function Movie({ movie, onSelectMovie }) {
  return (
    <li onClick={() => onSelectMovie(movie.imdbID)}>
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

function MovieDetails({ selectedId, onCloseMovie, onAddWatched, watched }) {
  const [movie, setMovie] = useState({});
  const [isLoading, SetIsLoading] = useState(false);
  const [userRating, setUserRating] = useState("");

  const countRef = useRef(0);

  useEffect(
    function () {
      if (userRating) countRef.current += 1;
    },
    [userRating],
  );

  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);
  const watchedUserRating = watched.find(
    (movie) => movie.imdbID === selectedId,
  )?.userRating;

  // each time component render hence []dependency array
  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Relased: released,
    Actors: actors,
    Director: direcotor,
    Genre: genre,
  } = movie;
  // console.log(title, actors, genre);

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
      countRatingDecisions: countRef.current,
    };
    onAddWatched(newWatchedMovie);
    onCloseMovie();
  }

  useEffect(
    function () {
      function callback(e) {
        if (e.code === "Escape") {
          onCloseMovie();
          // console.log("Closing...");
        }
      }
      document.addEventListener("keydown", callback);

      return function () {
        document.removeEventListener("keydown", callback);
      };
    },
    [onCloseMovie],
  );

  useEffect(
    function () {
      SetIsLoading(true);
      async function getMovieDetails() {
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`,
        );
        const data = await res.json();
        // console.log(data);
        setMovie(data);
        SetIsLoading(false);
      }
      getMovieDetails();
    },
    [selectedId],
  );

  useEffect(
    function () {
      if (!title) return;
      document.title = `Movie | ${title}`;

      return function () {
        document.title = "popCorn";
        console.log(`Clean up effect for movie ${title}`);

        // closure in JS mean a function will always remeber all the variables that were present at the time and place data function was created
      };
    },
    [title],
  );
  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              &larr;
            </button>
            <img src={poster} alt={`Poster of ${movie}`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐</span>
                {imdbRating} IMDb rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating
                    maxRating={10}
                    size={24}
                    onSetRating={setUserRating}
                  />
                  {userRating > 0 && (
                    <button className="btn-add" onClick={handleAdd}>
                      + Add to List
                    </button>
                  )}
                </>
              ) : (
                <p>
                  You Rated this movie {watchedUserRating}
                  <span>⭐</span>
                </p>
              )}
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>Staring {actors}</p>
            <p>Directed by {direcotor}</p>
          </section>
        </>
      )}
    </div>
  );
}

function WatchedMovieList({ watched, onDeleteWatched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.imdbID}
          onDeleteWatched={onDeleteWatched}
        />
      ))}
    </ul>
  );
}
function WatchedMovie({ movie, onDeleteWatched }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.Title} poster`} />
      <h3>{movie.title}</h3>
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

        <button
          className="btn-delete"
          onClick={() => onDeleteWatched(movie.imdbID)}
        >
          X
        </button>
      </div>
    </li>
  );
}

const DEFAULT_RUNTIME = 120;

function Summary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(
    watched.map((movie) => Number(movie.runtime) || DEFAULT_RUNTIME),
  );

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
          <span>{avgImdbRating.toFixed(1)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(1)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime.toFixed(2)} min</span>
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

/**
 * DEPENDENCY ARRAY
 * -> BY default effect run after every render we can prevent that by passing a dependency array
 * -> without the dependency array ,React doent know when to run the effect
 * -> Each time one of the depnedecies change the effect will be executed again
 * # every state variable and prop used inside the effect MUST be included in the dependency array (otherwise we get a "stale closure")
 * => useEffect is like an event listener that is listeniing for one dependency to change,Whenever a dependency chnages it will execute the effect again
 * -> effect react to update to state and props used inside the effect(the dependency).So effect are "reactive"
 * -> Component state/prop -> synchronize with -> external system(side effect)
 => Dependency(state or prop chnages)-> effect is executed again,component is re-rendered (effect and component lifecycle are deeply connected)
 -> we can use the dependency array to run effect ehrn the component render or re-renders

 | Hook Usage | Synchronization | Lifecycle |
|-------------|----------------|-----------|
| `useEffect(fn)` | Syncs with every render | Runs after every render |
| `useEffect(fn, [])` | No dependencies | Runs only once after mount |
| `useEffect(fn, [x])` | Syncs with `x` | Runs on mount and when `x` changes |
| `useEffect(fn, [x, y, z])` | Syncs with `x`, `y`, `z` | Runs on mount and when any dependency changes |
* => when are effect executed (timeline)

# Mounting(initial render)-> commit -> browser paint -> EFFECTS(if effect sets state ,an additional render will be required thast why it happens later) -> (title change -> re-render -> commit ->LAYOUT EFFECT -> browser paint -> CLEANUP -> EFFECT) -> unmount -> CLEANUP
 
 */

/**
 * THE CLEANUP FUNCTION
 * -> function that we can return from an effect(optional)
 * -> Runs on two occation
 * - 1. before the effect is executed
 * - 2. after a component has unmounted
 * -> component render=> execute effect if dependency array includes updated data
 * -> component unmount-> execute cleanup function
 * -> necessary whenever the side effect keeps happening after the component has been re-rendered or unmounted
 * -> eg: http request > cancel request in cleanup,API subscription > cancel subscription,start timer > stop timer,add event listener > remove listener
 * -> each effect should do only one thing! use on useEffect hook for each side effect.This makes effect easier to clean up
 */

/**
 * WHAT ARE REACT HOOKS?
 * -> special built-in function that allows us to "hook" into react interations:
 * - creating and accessing state from fiber tree
 * - registering side effects in fiber tree
 * - manula DOM selection
 * -> always start with "use"
 * -> enables easy reusing of non-visula logic:we can compose multiple hooks into out own custom hooks
 * -> give function component the ability to won state and run side effect at different lifecycle point(before v16.8 only available in class component)
 */

/**
 * OVERVIEW OF ALL BUILT-IN HOOKS
 | Most used   | Less used            | Only for libraries       |
|-------------|----------------------|--------------------------|
| useState    | useCallback          |                          |
| useEffect   | useMemo              |                          |
| useReducer  | useTransition        |                          |
| useContext  | useDeferredValue     | useSyncExternalStore     |
|             | useLayoutEffect      | useInsertionEffect       |
|             | useRef               |                          |
|             | useId                |                          |
|             | useImperativeHandle  |                          |
|             | useDebugValue        |                          |
 *
 */

/**
 * THE RULES OF HOOKS
 * -> only call hooks at the top level
 * - do not call hoooks inside conditionals,loops,nested function, or after an early return
 * - this is necessary to ensure that hooks are always called in the same order(hook rely on this)
 * # HOOKS REPLY ON CALL ORDER
 * -> react element tree(virtual DOM) - (on initial render) Fiber tree -> Fiber(props,..,linkedlist of hooks)
 * > is you called hook in conditions and suppose there are many hooks formed in form of linked list and if suppose one condition retuned false that means that hook is vanished but now what will happen to the link list now we have a hole in link list which is not possible
 * > why linked list then ,coz it a simplest way to represent to assocaite each hook with its value
 * -> only call hooks from react function
 * - only call hooks inside a function component or a custom hook
 * > these rules are automatically enforced by React's ESLint rules

 */

/**
 * Summary of defining and updating sytate
 * -> what ever we pass in useState is in initial state,react will only look at it on initial state that is when it mounts
 * -> creating state
 * - Simple
 * ```
 * const [count,setCount]=useState(23);
 * ```
 * - based on function(lazy evaluation)
 * ```
 * const [count,setCount]=useState(()=>localStorage.getItem("count"));
 * ```
 * > function must be pure and accept no argument,called only on initial render
 * -> Updating state
 * - Simple
 * ```
 * setCount(1000);
 * ```
 * - Based on current state
 * ```
 * setCount((c)=>c+1)
 * ```
 * > Function must be pure and return next state
 * ### make sure to NOT mutate object or array,but to replace them
 */

/**
 * RESUSING LOGIC WITH CUSTOM HOOKS
 * -> we can reuse two things in react a piece of UI(component) or logic(does logic have any hooks-(yes)-> Custom Hook -(No)-> Regualr function)
 * -> allow us to reuse non-visual logic in multiple components
 * -> one custom hook should have one purpose,to make it reusable and portable(even across multiple projects)
 * -> rules of hooks apply to custom hooks too
 * -> basically its just a JS function,unlike component it can receive and return any relevent data(usually [] or{})
 * -> custom hooks need to use one or more react hooks
 * -> fucntion names needs to start with use
 * => when to create one
 * - we want to reuse some part of non-visual logic
 * - simpley want to extract a hig part of our component out into some custom hook
 *
 */
