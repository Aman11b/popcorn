import { useState, useEffect } from "react";

const KEY = "20de2ed1";

export function useMovie(query) {
  const [movies, setMovies] = useState([]);
  const [isLoading, SetIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(
    function () {
      //   callback?.();
      const controller = new AbortController();
      async function fetchMovies() {
        try {
          SetIsLoading(true);
          setError("");
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
            { signal: controller.signal },
          );

          if (!res.ok) throw new Error("Some went wrong with fetching movie");

          // this is side effect
          const data = await res.json();
          if (data.Response === "False") throw new Error("❌ Movie not found");
          setMovies(data.Search);
          setError("");

          // console.log(data.Search);
        } catch (err) {
          // console.error(err.message);
          if (err.name !== "AbortError") {
            setError(err.message);
          }
        } finally {
          SetIsLoading(false);
        }
      }
      if (query.length < 3) {
        setMovies([]);
        setError("");
        return;
      }
      //   handleCloseMovie();
      fetchMovies();

      return function () {
        controller.abort();
      };
    },
    [query],
  );

  return { movies, isLoading, error };
}
