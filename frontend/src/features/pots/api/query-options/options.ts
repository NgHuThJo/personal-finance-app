import { queryOptions } from "@tanstack/react-query";

const potQueryKeys = {
  all: () => ["pots"],
};

const potQueryOptions = {
  getAll: queryOptions({
    queryKey: potQueryKeys.all(),
    queryFn: () => {},
  }),
};
