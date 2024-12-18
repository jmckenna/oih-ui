import React, { useState, useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Export } from "components/search-hub/Export";
import Stack from "@mui/material/Stack";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import useCookies from "context/useCookies";
import { SupportedLangugesEnum } from "context/AppTranslationProvider";
import TranslateIcon from "@mui/icons-material/Translate";
import { useAppTranslation } from "context/context/AppTranslation";
import ResultValue from "components/search-hub/ResultValue";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import IconButton from "@mui/material/IconButton";
import HeaderDrawer from "./HeaderDrawer";
import TableDrawer from "./TableDrawer";

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const DrawerContainer = (props) => {
  const {
    results,
    setSearchText,
    searchText,
    resultsCount,
    getDataSpatialSearch,
    isLoading,
    handleSubmit,
    setSelectedFacets,
    selectedFacets,
    facetSearch,
    clear,
    changeSelectedElem,
    selectedElem,
    currentURI,
    mapBounds,
    initMapBounds,
  } = props;
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("");
  const [dataTable, setDataTable] = useState([]);
  const [page, setPage] = useState(1);
  const mainBoxRef = useRef(null);
  const [mainBoxHeight, setMainBoxHeight] = useState(0);
  const [selectedResult, setSelectedResult] = useState(undefined);

  useEffect(() => {
    setSelectedResult(selectedElem);
  }, [selectedElem]);

  useEffect(() => {
    !selectedResult &&
      setDataTable(
        results.map((r) => {
          return { name: r.name, id: r.index_id, provider: r.txt_provider };
        })
      );
  }, [results, selectedResult]);

  const handleRequestSort = (property) => (event) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const headCells = [
    {
      id: "name",
      label: "Title",
    },
  ];

  const visibleRows = React.useMemo(
    () => stableSort(dataTable, getComparator(order, orderBy)),
    [order, orderBy, dataTable]
  );

  const changeTranslation = (languageCode) => {
    translationState.updateTranslation(languageCode);
  };

  useEffect(() => {
    page !== 1 &&
      getDataSpatialSearch(
        mapBounds !== false ? mapBounds : initMapBounds,
        page
      );
  }, [page]);

  useEffect(() => {
    const mainBox = mainBoxRef.current;
    if (mainBox === null) return;

    const mainBoxObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === mainBox) {
          setMainBoxHeight(entry.target.clientHeight);
        }
      }
    });

    mainBoxObserver.observe(mainBox);

    return () => mainBoxObserver.unobserve(mainBox);
  }, [selectedResult]);

  const palette = "custom.mapView.desktop.drawer.";
  const translationState = useAppTranslation();
  return (
    <Box sx={{ height: "100%" }}>
      {selectedResult === undefined && (
        <Stack sx={{ height: "100%" }}>
          <HeaderDrawer
            changeTranslation={changeTranslation}
            selectedFacets={selectedFacets}
            facetSearch={facetSearch}
            searchText={searchText}
            setSearchText={setSearchText}
            handleSubmit={handleSubmit}
            setSelectedFacets={setSelectedFacets}
            clear={clear}
          />
          <Box sx={{ height: "inherit" }} ref={mainBoxRef}>
            <TableDrawer
              isLoading={isLoading}
              visibleRows={visibleRows}
              resultsCount={resultsCount}
              setPage={setPage}
              page={page}
              mainBoxHeight={mainBoxHeight}
              headCells={headCells}
              order={order}
              orderBy={orderBy}
              handleRequestSort={handleRequestSort}
              setSelectedResult={setSelectedResult}
              results={results}
            />
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              padding: "12px",
              alignItems: "center",
            }}
          >
            <Export
              palette={"custom.resultPage.searchBar."}
              uri={currentURI}
              searchType={"SpatialData"}
              resultCount={resultsCount}
            />
            <Typography
              variant="subtitle"
              sx={{
                color: palette + "colorTypography",
                fontSize: "14px",
                fontWeight: 700,
              }}
            >
              {resultsCount +
                " " +
                translationState.translation["Results"].toLowerCase()}
            </Typography>
          </Box>
        </Stack>
      )}
      {selectedResult && (
        <ResultDetails
          result={selectedResult}
          setSelectedResult={setSelectedResult}
          changeTranslation={changeTranslation}
          languageIcon={TranslateIcon}
          changeSelectedElem={changeSelectedElem}
        />
      )}
    </Box>
  );
};

const ResultDetails = (props) => {
  const {
    result,
    setSelectedResult,
    changeTranslation,
    changeSelectedElem,
  } = props;

   const palette = "custom.mapView.desktop.resultsDetails.";
  return (
    <Stack sx={{ height: "100%", ".MuiPaper-root": { border: 0 } }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          padding: "10px",
        }}
      >
        <IconButton
          aria-label="goBack"
          onClick={() => {
            changeSelectedElem(undefined);
            setSelectedResult(undefined);
          }}
        >
          <KeyboardBackspaceIcon
            sx={{
              color: palette + "iconKeyboardColor",
            }}
          />
        </IconButton>
        <Box
          sx={{
            width: "100px",
            display: "flex",
            paddingTop: "8px",
            marginLeft: "auto",
            marginRight: "8px",
          }}
        >
          <Select
            defaultValue={"EN"}
            value={
              useCookies.getCookie("language")
                ? useCookies.getCookie("language")
                : SupportedLangugesEnum.En
            }
            name="languageChoice"
            onChange={(e) => changeTranslation(e.target.value)}
            sx={{
              backgroundColor: {
                xs: "transparent",
                lg: palette + "bgSelectNeutral",
              },
              color: palette + "colorSelect",
              fontWeight: 600,
              borderRadius: 1,
              height: "34px",
              width: "70px",
              ".MuiSelect-outlined": {
                textOverflow: "initial !important",
              },
              ".MuiOutlinedInput-notchedOutline": {
                borderColor: palette + "borderOutlineSelect",
                borderRight: 0,
              },
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
              ".MuiSelect-icon": {
                color: palette + "colorSelect",
              },
            }}
          >
            <MenuItem
              key={SupportedLangugesEnum.En}
              value={SupportedLangugesEnum.En}
            >
              {SupportedLangugesEnum.En}
            </MenuItem>
            <MenuItem
              key={SupportedLangugesEnum.Es}
              value={SupportedLangugesEnum.Es}
            >
              {SupportedLangugesEnum.Es}
            </MenuItem>
            <MenuItem
              key={SupportedLangugesEnum.Ru}
              value={SupportedLangugesEnum.Ru}
            >
              {SupportedLangugesEnum.Ru}
            </MenuItem>
            <MenuItem
              key={SupportedLangugesEnum.Fr}
              value={SupportedLangugesEnum.Fr}
            >
              {SupportedLangugesEnum.Fr}
            </MenuItem>
          </Select>
          <Box
            sx={{
              width: "30px",
              border: "1px solid",
              borderColor: palette + "borderOutlineSelect",
              borderTopRightRadius: 3,
              borderBottomRightRadius: 3,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <TranslateIcon sx={{ width: 20, height: 20 }} />
          </Box>
        </Box>
      </Box>
      <ResultValue result={result} />
    </Stack>
  );
};
export default DrawerContainer;
