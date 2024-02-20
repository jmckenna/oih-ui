import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import OutlinedInput from "@mui/material/OutlinedInput";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAppTranslation } from "context/context/AppTranslation";
import Alert from "@mui/material/Alert";
import { CATEGORIES } from "portability/configuration";
import Divider from "@mui/material/Divider";
import {fieldTitleFromName, useSearchParam} from "utilities/generalUtility";
import { dataServiceUrl } from "config/environment";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import {useNavigate} from "react-router-dom";

const AdvancedSearch = (props) => {
  const { setSearchQuery, searchQuery, facets } = props;
  const palette = "custom.resultPage.searchBar.advancedSearch.";
  const translationState = useAppTranslation();
  const [facetsToShow, setFacetsToShow] = useState(facets);
  const [alertMessage, setAlertMessage] = useState("");
  const [searchAdvancedQuery, setSearchAdvancedQuery] = useState({
    0: {
      category: "Topic",
      value: "Documents",
    },
    1: [
      {
        id: 0,
        category: "Provider",
        value: "",
        operator: "Contains",
        text: "",
      },
    ],
  });
  const navigator = useNavigate();
  const [region, setRegion] = useSearchParam("region", "global");

  const changeTopic = (topic) => {
    const idTopic = CATEGORIES.find((c) => c.text === topic).id;
    let URI = `${dataServiceUrl}/search?`;
    URI += "document_type=" + idTopic + "&";
    URI += "&start=0&rows=10";
    fetch(URI)
      .then((response) => response.json())
      .then((json) => {
        setFacetsToShow(json.facets.filter((facet) => facet.counts.length > 0));
      });
  };

  const showCorrectSubFacets = (category) => {
    const correctFacet = facetsToShow.filter((f) => {
      const title = fieldTitleFromName(f.name);
      if (category === title) {
        return f;
      }
    });

    return correctFacet[0].counts.map((c) => {
      return {
        label: c.name,
        value: c.name,
      };
    });
  };

  useEffect(() => {
    changeTopic("Documents");
  }, []);

  const createSearchQuery = () => {
    // Build SOLR facet query
    let facetQuery = `type:(${searchAdvancedQuery[0].value})`;

    /** @type {{id: number, category: string, value: string, operator: string, textfield: string}[][]} */
    const groups = Object.values(searchAdvancedQuery).toSpliced(0, 1);

    const categories = {
      Provider: 'provider',
      Keywords: 'keywords',
      Contributor: 'contributor'
    }

    function valueMapper(text, operator) {
      if (operator.endsWith('Contains')) {
        return `*${text}*`;
      }
      return text;
    }

    for (const group of groups) {
      facetQuery += ' AND (';

      for (const [index, value] of group.entries()) {
        if (!value.textfield) {
          setAlertMessage(
            "Please kindly fill in all fields or, if not applicable, feel free to remove them"
          );
        }

        facetQuery +=
          (value.operator.startsWith('Not') ? '-' : '')
          + "txt_"
          + categories[value.category] + ":" + valueMapper(value.textfield, value.operator);

        if (index < group.length - 1) {
          facetQuery += ' OR ';
        }
      }
      facetQuery += ')';
    }

    const [_, url, tabName = ""] = window.location.pathname.split("/");

    const hrefFor = (region, query) =>
      `/results/${tabName}?${new URLSearchParams({
        ...(query ? { fq: query } : {}),
        ...(region && region.toUpperCase() !== "GLOBAL" ? { region } : {}),
      })}`;
    navigator(hrefFor(region, facetQuery))
  };

  return (
    <>
      <Grid item container gap={1}>
        <Grid item xs={12} lg={7}>
          <Typography
            variant="body2"
            alignItems={"start"}
            display={{ xs: "none", lg: "flex" }}
            sx={{ color: palette + "colorTextProTip" }}
          >
            <LightbulbOutlinedIcon sx={{ color: palette + "iconProtip" }} />
            {translationState.translation["Pro Tip"]}
          </Typography>
        </Grid>
        <Grid item lg={12} />
        <Grid
          item
          lg={12}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginBottom: 1,
          }}
        >
          <Typography
            variant="body1"
            alignItems={"start"}
            sx={{
              color: palette + "colorTypography",
              fontWeight: 700,
              fontSize: "16px",
            }}
          >
            Search for:
          </Typography>
          <Select
            defaultValue="Documents"
            sx={{
              color: palette + "colorTypography",
              fontWeight: 600,
              borderRadius: 1,
              height: "30px",
              maxWidth: "9.5rem",
              minWidth: "9.5rem",
            }}
            onChange={(e) => {
              const resetObj = {
                0: {
                  category: "Topic",
                  value: e.target.value,
                },
                1: [
                  {
                    id: 0,
                    category: "Provider",
                    value: "",
                    operator: "Contains",
                    text: "",
                  },
                ],
              };
              changeTopic(e.target.value);
              setSearchAdvancedQuery(resetObj);
            }}
          >
            {CATEGORIES.map((c, index) => (
              <MenuItem key={index} value={c.text}>
                {translationState.translation[c.text]}
              </MenuItem>
            ))}
          </Select>
        </Grid>
        <Grid
          item
          container
          columnGap={1}
          rowGap={1}
          lg={8}
          display={{ xs: "flex", lg: "flex" }}
          alignItems={"center"}
        >
          {Object.keys(searchAdvancedQuery).map((key, index) => {
            if (key !== "0") {
              return (
                <Grid item xs={12} lg={12} key={key}>
                  <Box display={{ lg: "none" }}>
                    <Grid container display={"flex"} spacing={1}>
                      {index === 1 && (
                        <Grid item xs={12}>
                          <Divider
                            sx={{
                              color: palette + "dividerColor",
                              fontWeight: 700,
                              "&::before, &::after": {
                                borderColor: "rgba(0, 0, 0, 0.50);",
                              },
                            }}
                          >
                            AND
                          </Divider>
                        </Grid>
                      )}
                      {searchAdvancedQuery[key].map((v, index2) => {
                        return (
                          <>
                            <Grid key={index2} item xs={7}>
                              <Select
                                defaultValue={"Provider"}
                                sx={{
                                  color: palette + "colorTypography",
                                  fontWeight: 600,
                                  borderRadius: 1,
                                  height: "40px",
                                  width: "100%",
                                }}
                                onChange={(e) => {
                                  const newArray = [
                                    ...searchAdvancedQuery[key],
                                  ];
                                  const updatedArray = newArray.map((obj) =>
                                    obj.id === v.id
                                      ? { ...obj, category: e.target.value }
                                      : obj
                                  );

                                  setSearchAdvancedQuery({
                                    ...searchAdvancedQuery,
                                    [key]: updatedArray,
                                  });
                                }}
                              >
                                <MenuItem value={"Provider"}>Provider</MenuItem>
                                {facetsToShow.map((f, index) => {
                                  const title = fieldTitleFromName(f.name);
                                  if (title !== "Provider")
                                    return (
                                      <MenuItem key={index} value={title}>
                                        {title}
                                      </MenuItem>
                                    );
                                })}
                              </Select>
                            </Grid>
                            <Grid item xs={5} display={"flex"} columnGap={1}>
                              <Button
                                variant={"outlined"}
                                sx={{
                                  height: "40px",
                                  minWidth: "44px",
                                  borderColor: palette + "borderColor",
                                  color: palette + "colorTypography",
                                  width: "50px",
                                }}
                                onClick={() => {
                                  const lastID =
                                    searchAdvancedQuery[key][
                                      searchAdvancedQuery[key].length - 1
                                    ].id;

                                  const newKey = parseInt(lastID) + 1;

                                  setSearchAdvancedQuery({
                                    ...searchAdvancedQuery,
                                    [key]: [
                                      ...searchAdvancedQuery[key],
                                      {
                                        id: newKey,
                                        category: "Provider",
                                        value: "",
                                        operator: "Contains",
                                        text: ""
                                      },
                                    ],
                                  });
                                }}
                              >
                                OR
                              </Button>
                              <Button
                                variant={"outlined"}
                                disabled={
                                  index2 !== searchAdvancedQuery[key].length - 1
                                }
                                sx={{
                                  height: "40px",
                                  minWidth: "44px",
                                  borderColor: palette + "borderColor",
                                  color: palette + "colorTypography",
                                  width: "50px",
                                }}
                                onClick={() => {
                                  const keys = Object.keys(searchAdvancedQuery);

                                  const lastKey = Math.max(
                                    ...keys.map((key) => parseInt(key, 10))
                                  );

                                  const newKey = lastKey + 1;

                                  const obj = {
                                    ...searchAdvancedQuery,
                                    [newKey]: [
                                      {
                                        id: 0,
                                        category: "Provider",
                                        value: "",
                                        operator: "Contains",
                                        text: ""
                                      },
                                    ],
                                  };

                                  setSearchAdvancedQuery(obj);
                                }}
                              >
                                AND
                              </Button>
                              {(searchAdvancedQuery[key].length > 1 ||
                                index >= 2) && (
                                <IconButton
                                  aria-label="remove"
                                  sx={{
                                    border: " 1px solid #aaa",
                                    borderRadius: "6px",
                                    backgroundColor: "#FBE5E6",
                                  }}
                                  onClick={() => {
                                    setSearchAdvancedQuery((prevState) => {
                                      const updatedSearchAdvancedQuery = {
                                        ...prevState,
                                      };
                                      delete updatedSearchAdvancedQuery[key];
                                      const updatedArray = prevState[
                                        key
                                      ].filter((f) => f.id !== v.id);
                                      if (updatedArray.length > 0)
                                        return {
                                          ...updatedSearchAdvancedQuery,
                                          [key]: updatedArray,
                                        };
                                      else
                                        return {
                                          ...updatedSearchAdvancedQuery,
                                        };
                                    });
                                  }}
                                >
                                  <DeleteIcon sx={{ color: "#CC0000" }} />
                                </IconButton>
                              )}
                            </Grid>
                            <Grid item xs={12}>
                              <Select
                                defaultValue="Contains"
                                sx={{
                                  color: palette + "colorTypography",
                                  fontWeight: 600,
                                  borderRadius: 1,
                                  height: "40px",
                                  width: "100%",
                                }}
                                onChange={(e) => {
                                  const newArray = [
                                    ...searchAdvancedQuery[key],
                                  ];
                                  const updatedArray = newArray.map((obj) =>
                                    obj.id === v.id
                                      ? { ...obj, operator: e.target.value }
                                      : obj
                                  );

                                  setSearchAdvancedQuery({
                                    ...searchAdvancedQuery,
                                    [key]: updatedArray,
                                  });
                                }}
                              >
                                <MenuItem value="Contains">Contains</MenuItem>
                                <MenuItem value="NotContains">
                                  Not Contains
                                </MenuItem>
                                <MenuItem value="Equals">Equals</MenuItem>
                                <MenuItem value="NotEquals">
                                  Not Equals
                                </MenuItem>
                              </Select>
                            </Grid>
                            <Grid item xs={12}>
                              {(v.operator === "Contains" ||
                                v.operator === "NotContains") && (
                                <OutlinedInput
                                  sx={{
                                    height: "40px",
                                    marginRight: 4,
                                    width: "100%",
                                  }}
                                  onInput={(e) => {
                                    const newArray = [
                                      ...searchAdvancedQuery[key],
                                    ];
                                    const updatedArray = newArray.map((obj) =>
                                      obj.id === v.id
                                        ? { ...obj, textfield: e.target.value }
                                        : obj
                                    );
                                    setSearchAdvancedQuery({
                                      ...searchAdvancedQuery,
                                      [key]: updatedArray,
                                    });
                                  }}
                                  placeholder="Please enter text"
                                />
                              )}
                              {(v.operator === "Equals" ||
                                v.operator === "NotEquals") && (
                                <Autocomplete
                                  disablePortal
                                  id="combo-box-demo"
                                  options={showCorrectSubFacets(v.category)}
                                  sx={{
                                    height: "40px",
                                    marginRight: 4,
                                    width: "100%",
                                  }}
                                  renderInput={(params) => (
                                    <TextField
                                      sx={{
                                        paddingTop: 0,
                                        ".MuiOutlinedInput-root": {
                                          height: "40px",
                                        },
                                      }}
                                      {...params}
                                      placeholder="Please enter text"
                                    />
                                  )}
                                />
                              )}
                            </Grid>
                            {index2 !== searchAdvancedQuery[key].length - 1 &&
                              searchAdvancedQuery[key].length > 1 && (
                                <Grid item xs={12}>
                                  <Typography
                                    variant="body1"
                                    sx={{
                                      color: palette + "andOrColor",
                                      fontWeight: 700,
                                      marginBottom: "3px",
                                      textAlign: "center",
                                    }}
                                  >
                                    OR
                                  </Typography>
                                </Grid>
                              )}
                          </>
                        );
                      })}
                      {index !== Object.keys(searchAdvancedQuery).length - 1 &&
                        Object.keys(searchAdvancedQuery).length > 2 && (
                          <Grid item xs={12}>
                            <Divider
                              sx={{
                                color: palette + "dividerColor",
                                fontWeight: 700,
                                "&::before, &::after": {
                                  borderColor: "rgba(0, 0, 0, 0.50);",
                                },
                              }}
                            >
                              AND
                            </Divider>
                          </Grid>
                        )}
                    </Grid>
                  </Box>
                  <Box display={{ xs: "none", lg: "block" }}>
                    {index === 1 && (
                      <Grid item xs={12}>
                        <Divider
                          textAlign="left"
                          sx={{
                            color: palette + "dividerColor",
                            fontWeight: 700,
                            "&::before, &::after": {
                              borderColor: "rgba(0, 0, 0, 0.50);",
                            },
                            marginBottom: 1,
                          }}
                        >
                          AND
                        </Divider>
                      </Grid>
                    )}
                    {searchAdvancedQuery[key].map((v, index2) => {
                      return (
                        <Box key={v.id}>
                          <Box
                            display={{ xs: "none", lg: "flex" }}
                            alignItems={"center"}
                            columnGap={1}
                            sx={{ marginBottom: 1 }}
                          >
                            <Select
                              defaultValue={"Provider"}
                              sx={{
                                color: palette + "colorTypography",
                                fontWeight: 600,
                                borderRadius: 1,
                                height: "40px",
                                maxWidth: "8.5rem",
                                minWidth: "8.5rem",
                              }}
                              onChange={(e) => {
                                const newArray = [...searchAdvancedQuery[key]];
                                const updatedArray = newArray.map((obj) =>
                                  obj.id === v.id
                                    ? { ...obj, category: e.target.value }
                                    : obj
                                );

                                setSearchAdvancedQuery({
                                  ...searchAdvancedQuery,
                                  [key]: updatedArray,
                                });
                              }}
                            >
                              <MenuItem value={"Provider"}>Provider</MenuItem>
                              {facetsToShow.map((f, index) => {
                                const title = fieldTitleFromName(f.name);
                                if (title !== "Provider")
                                  return (
                                    <MenuItem key={index} value={title}>
                                      {title}
                                    </MenuItem>
                                  );
                              })}
                            </Select>
                            <Select
                              defaultValue="Contains"
                              sx={{
                                color: palette + "colorTypography",
                                fontWeight: 600,
                                borderRadius: 1,
                                height: "40px",
                                maxWidth: "8.5rem",
                                minWidth: "8.5rem",
                              }}
                              onChange={(e) => {
                                const newArray = [...searchAdvancedQuery[key]];
                                const updatedArray = newArray.map((obj) =>
                                  obj.id === v.id
                                    ? { ...obj, operator: e.target.value }
                                    : obj
                                );

                                setSearchAdvancedQuery({
                                  ...searchAdvancedQuery,
                                  [key]: updatedArray,
                                });
                              }}
                            >
                              <MenuItem value="Contains">Contains</MenuItem>
                              <MenuItem value="NotContains">
                                Not Contains
                              </MenuItem>
                              <MenuItem value="Equals">Equals</MenuItem>
                              <MenuItem value="NotEquals">Not Equals</MenuItem>
                            </Select>
                            {(v.operator === "Contains" ||
                              v.operator === "NotContains") && (
                              <OutlinedInput
                                sx={{
                                  height: "40px",
                                  marginRight: 4,
                                  width: "250px",
                                }}
                                onInput={(e) => {
                                  const newArray = [
                                    ...searchAdvancedQuery[key],
                                  ];
                                  const updatedArray = newArray.map((obj) =>
                                    obj.id === v.id
                                      ? { ...obj, textfield: e.target.value }
                                      : obj
                                  );
                                  setSearchAdvancedQuery({
                                    ...searchAdvancedQuery,
                                    [key]: updatedArray,
                                  });
                                }}
                                placeholder="Please enter text"
                              />
                            )}
                            {(v.operator === "Equals" ||
                              v.operator === "NotEquals") && (
                              <Autocomplete
                                disablePortal
                                id="combo-box-demo"
                                options={showCorrectSubFacets(v.category)}
                                sx={{
                                  height: "40px",
                                  marginRight: 4,
                                  width: "250px",
                                }}
                                onInput={(e) => {
                                  const newArray = [
                                    ...searchAdvancedQuery[key],
                                  ];
                                  const updatedArray = newArray.map((obj) =>
                                    obj.id === v.id
                                      ? { ...obj, textfield: e.target.value }
                                      : obj
                                  );
                                  setSearchAdvancedQuery({
                                    ...searchAdvancedQuery,
                                    [key]: updatedArray,
                                  });
                                }}
                                renderInput={(params) => (
                                  <TextField
                                    sx={{
                                      ".MuiOutlinedInput-root": {
                                        height: "40px",
                                        paddingTop: 0,
                                      },
                                    }}
                                    {...params}
                                    placeholder="Please enter text"
                                  />
                                )}
                              />
                            )}

                            <Button
                              variant={"outlined"}
                              sx={{
                                height: "40px",
                                minWidth: "44px",
                                borderColor: palette + "borderColor",
                                color: palette + "colorTypography",
                                width: "50px",
                              }}
                              onClick={() => {
                                const lastID =
                                  searchAdvancedQuery[key][
                                    searchAdvancedQuery[key].length - 1
                                  ].id;

                                const newKey = parseInt(lastID) + 1;

                                setSearchAdvancedQuery({
                                  ...searchAdvancedQuery,
                                  [key]: [
                                    ...searchAdvancedQuery[key],
                                    {
                                      id: newKey,
                                      category: "Provider",
                                      value: "",
                                      operator: "Contains",
                                      text: ""
                                    },
                                  ],
                                });
                              }}
                            >
                              OR
                            </Button>
                            <Button
                              variant={"outlined"}
                              disabled={
                                index2 !== searchAdvancedQuery[key].length - 1
                              }
                              sx={{
                                height: "40px",
                                minWidth: "44px",
                                borderColor: palette + "borderColor",
                                color: palette + "colorTypography",
                                width: "50px",
                              }}
                              onClick={() => {
                                const keys = Object.keys(searchAdvancedQuery);

                                const lastKey = Math.max(
                                  ...keys.map((key) => parseInt(key, 10))
                                );

                                const newKey = lastKey + 1;

                                const obj = {
                                  ...searchAdvancedQuery,
                                  [newKey]: [
                                    {
                                      id: 0,
                                      category: "Provider",
                                      value: "",
                                      operator: "Contains",
                                      text: ""
                                    },
                                  ],
                                };

                                setSearchAdvancedQuery(obj);
                              }}
                            >
                              AND
                            </Button>

                            {(searchAdvancedQuery[key].length > 1 ||
                              Object.keys(searchAdvancedQuery).length > 2) && (
                              <IconButton
                                aria-label="remove"
                                sx={{
                                  border: " 1px solid #aaa",
                                  borderRadius: "6px",
                                  backgroundColor: "#FBE5E6",
                                }}
                                onClick={() => {
                                  setSearchAdvancedQuery((prevState) => {
                                    const updatedSearchAdvancedQuery = {
                                      ...prevState,
                                    };
                                    delete updatedSearchAdvancedQuery[key];
                                    const updatedArray = prevState[key].filter(
                                      (f) => f.id !== v.id
                                    );
                                    if (updatedArray.length > 0)
                                      return {
                                        ...updatedSearchAdvancedQuery,
                                        [key]: updatedArray,
                                      };
                                    else
                                      return {
                                        ...updatedSearchAdvancedQuery,
                                      };
                                  });
                                }}
                              >
                                <DeleteIcon sx={{ color: "#CC0000" }} />
                              </IconButton>
                            )}
                          </Box>
                          {index2 !== searchAdvancedQuery[key].length - 1 &&
                            searchAdvancedQuery[key].length > 1 && (
                              <Typography
                                variant="body1"
                                sx={{
                                  color: palette + "andOrColor",
                                  paddingLeft: 2,
                                  fontWeight: 700,
                                  marginBottom: "3px",
                                }}
                              >
                                OR
                              </Typography>
                            )}
                        </Box>
                      );
                    })}
                    {index !== Object.keys(searchAdvancedQuery).length - 1 &&
                      Object.keys(searchAdvancedQuery).length > 2 && (
                        <Divider
                          textAlign={"left"}
                          sx={{
                            color: palette + "dividerColor",
                            fontWeight: 700,
                            "&::before, &::after": {
                              borderColor: "rgba(0, 0, 0, 0.50);",
                            },
                          }}
                        >
                          AND
                        </Divider>
                      )}
                    {/*
                    {facets.map((f, index) => {
                      const title = fieldTitleFromName(f.name);
                      const values = f.counts;
                      if (searchAdvancedQuery[key].category === title)
                        return (
                          <Box key={index}>
                            <Select
                              defaultValue={""}
                              sx={{
                                color: palette + "colorTypography",
                                fontWeight: 600,
                                borderRadius: 1,
                                height: "40px",
                                maxWidth: "8.5rem",
                                minWidth: "8.5rem",
                              }}
                              onChange={(e) => {
                                const obj = {
                                  ...searchAdvancedQuery[key],
                                  subCategory: e.target.value,
                                };
                                setSearchAdvancedQuery({
                                  ...searchAdvancedQuery,
                                  [key]: obj,
                                });
                              }}
                            >
                              {values &&
                                values.map((v, index) => (
                                  <MenuItem key={index} value={v.name}>
                                    {v.name}
                                  </MenuItem>
                                ))}
                            </Select>
                          </Box>
                        );
                    })}
 */}
                  </Box>
                </Grid>
              );
            }
          })}
          {alertMessage && (
            <Grid item xs={12}>
              <Alert severity="error">{alertMessage}</Alert>
            </Grid>
          )}
          <Grid
            item
            xs={12}
            display={"flex"}
            flexDirection={{ xs: "column", lg: "row" }}
            sx={{ width: "100%", mb: { xs: 2, lg: "unset" } }}
          >
            <Button
              variant="contained"
              disableElevation
              onClick={createSearchQuery}
              sx={{
                borderRadius: 2,
                backgroundColor: palette + "buttonBgColor",
                textTransform: "none",
              }}
            >
              {translationState.translation["Apply"]}
            </Button>
            <Button
              variant="text"
              disableElevation
              onClick={() =>
                setSearchAdvancedQuery({
                  0: {
                    category: "Topic",
                    value: "Documents",
                  },
                  1: [
                    {
                      id: 0,
                      category: "Provider",
                      value: "",
                      operator: "Contains",
                      text: "",
                    },
                  ],
                })
              }
              sx={{
                color: palette + "clearButtonColor",
                textTransform: "none",
                fontSize: "14px",
                padding: 0,
              }}
            >
              {translationState.translation["Clear"]}
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default AdvancedSearch;