import SearchBar from "./SearchBar";

export default function HomeSearchBar({
                                          search,
                                          setSearch,
                                          onSearch,
                                          onOpenFilters,
                                      }) {
    return (
        <SearchBar
            search={search}
            setSearch={setSearch}
            onSearch={onSearch}
            onOpenFilters={onOpenFilters}
            placeholder="Профессия, должность или компания"
        />
    );
}