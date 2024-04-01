import libgen from "libgen";

const fetchBooks = async (query: string) => {
  const options = {
    mirror: "http://gen.lib.rus.ec",
    query: query,
    count: 2,
    sort_by: "year",
    reverse: true,
  };

  const data = await libgen.search(options);

  return data;
};

export default fetchBooks;
