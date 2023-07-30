import React, { useEffect } from "react";
import { useFetch } from "../../hooks/useFetch";
import "./FeedSearch.scss";


interface FeedSearchProps {
  setResponse: any;
  url: any;
}

function FeedSearch({ setResponse, url }: FeedSearchProps) {
  const response = useFetch(url);
  // const response = await parse(url);
  // console.error(response)
  useEffect(() => {
    setResponse(response);
  }, [response, setResponse]);

  return (
    <>
    </>
  );
}

export default FeedSearch;
