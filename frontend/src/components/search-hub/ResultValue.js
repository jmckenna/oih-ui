import Box from "@mui/material/Box";
import React, { useState } from "react";
import Button from "@mui/material/Button";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CircleIcon from "@mui/icons-material/Circle";
import completed100 from "../../resources/svg/100Completed.svg";
import completed75 from "../../resources/svg/75Completed.svg";
import completed50 from "../../resources/svg/50Completed.svg";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Icon from "@mui/material/Icon";
import { TypesMap } from "../../portability/typesMap";
import Link from "@mui/material/Link";
import { dataServiceUrl } from "../../config/environment";
import { useAppTranslation } from "context/context/AppTranslation";
import SearchIcon from "@mui/icons-material/Search";
import { trackingMatomo } from "utilities/trackingUtility";
import Tooltip from "@mui/material/Tooltip";
import { cutWithDots } from "components/results/ResultDetails";

const ResultValue = (props) => {
  const {
    result,
    completeValue,
    onlyVerified,
    page,
    counterResult,
    queryString,
    totalPageNumber,
  } = props;

  const translationState = useAppTranslation();
  const [iconLD, setIconLD] = useState(<CodeOutlinedIcon />);
  var CryptoJS = require("crypto-js");
  function isVerified(id) {
    const hash = CryptoJS.SHA256(id).toString();
    const fifthChar = hash.charAt(4);
    const fifthNumber = parseInt(fifthChar, 16);
    return fifthNumber > 5;
  }

  function getCompleteness(id) {
    const hash = CryptoJS.SHA256(id);
    const completenessLevels = [50, 70, 100];
    const hashInt = parseInt(hash, 16);
    return completenessLevels[hashInt % completenessLevels.length];
  }

  function resolveAsUrl(url) {
    const pattern = /^((http|https):\/\/)/;
    if (!pattern.test(url)) {
      return "http://" + url;
    }
    return url;
  }

  function formatDate(inputDateString) {
    var inputDate = new Date(inputDateString);

    var months = {
      0: "January",
      1: "February",
      2: "March",
      3: "April",
      4: "May",
      5: "June",
      6: "July",
      7: "August",
      8: "September",
      9: "October",
      10: "November",
      11: "December",
    };

    var year = inputDate.getFullYear();
    var monthNumber = inputDate.getMonth();
    var day = inputDate.getDate();

    var monthName = months[monthNumber];

    var formattedDate = year + " " + monthName + " " + day;

    return formattedDate;
  }

  var url = result["txt_url"] || "";

  const { Component } = TypesMap[result["type"]] || TypesMap.default;
  const [truncate, setTruncate] = useState(true);
  const jsonLdParams = new URLSearchParams({ id: result["id"] }).toString();

  const sendMatomoEvent = (action, link) => {
    const stringResult = `${link}|index_result=${counterResult}|page=${
      parseInt(page) + 1
    }|totalPagesNumber=${totalPageNumber}|queryString=${queryString}`;

    trackingMatomo(action, "click", stringResult);
  };

  const palette = "custom.resultPage.resultsDetails.";
  if ((onlyVerified && isVerified(result["id"])) || !onlyVerified) {
    return (
      <Card
        key={result["id"]}
        sx={{
          borderRadius: 1,
          border: 1,
          borderColor: "rgba(0, 0, 0, 0.12)",

          minHeight: { xs: "225px", lg: "200px" },
        }}
        elevation={0}
      >
        {isVerified(result["id"]) && (
          <CardHeader
            avatar={
              <Chip
                avatar={
                  <CheckCircleOutlineIcon
                    color="success"
                    sx={{ color: "green" }}
                  />
                }
                label="Verified"
                variant="outlined"
                color="success"
                sx={{
                  color: palette + "colorChipVerified",
                  ".MuiChip-avatar": {
                    color: palette + "colorVerifiedAvatar",
                  },
                }}
              />
            }
          />
        )}

        <CardContent>
          <Stack spacing={1}>
            <Link
              href={url === "" ? `/record/${jsonLdParams}` : url}
              underline="hover"
              target="_blank"
              onClick={() => sendMatomoEvent("click_on_result", url)}
              onAuxClick={() => sendMatomoEvent("click_on_result", url)}
            >
              <Typography
                sx={{ fontSize: 21, color: palette + "colorTypography" }}
                gutterBottom
              >
                {result["name"]}
              </Typography>
            </Link>

            <Component result={result} />
            {"description" in result && result["type"] !== "Person" && (
              <Typography
                sx={{
                  fontSize: "16px",
                  ...(truncate && {
                    display: "-webkit-box",
                    maxWidth: "100%",
                    WebkitLineClamp: 4,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }),
                }}
                onClick={() => setTruncate(false)}
              >
                {result["description"]}
              </Typography>
            )}

            <Typography
              sx={{ fontSize: "12px", color: "#42526E" }}
              display={"flex"}
              alignItems={"center"}
            >
              <Icon sx={{ padding: 0 }}>
                <img
                  alt=""
                  src={
                    getCompleteness(result["id"]) === 50
                      ? completed50
                      : getCompleteness(result["id"]) === 75
                      ? completed75
                      : completed100
                  }
                  height={20}
                  width={20}
                />
              </Icon>
              Data completeness{" "}
              {getCompleteness(result["id"]) === 50
                ? 50
                : getCompleteness(result["id"]) === 75
                ? 75
                : 100}
              %
              <InfoOutlinedIcon
                sx={{
                  marginLeft: 1,
                  fontSize: "14px",
                  color: palette + "completenessColor",
                }}
              />
            </Typography>

            <Box
              display={"flex"}
              justifyContent={"space-between"}
              flexDirection={{ xs: "column", lg: "row" }}
              gap={{ xs: 2, lg: 0 }}
            >
              <Typography
                component={"span"}
                sx={{
                  fontSize: { xs: "10px", md: "12px" },
                  color: palette + "contributorColor",
                }}
                display={"flex"}
                alignItems={"center"}
                gap={2}
              >
                {"txt_contributor" in result && (
                  <Box display={"flex"} gap={1}>
                    <Typography
                      sx={{
                        fontSize: "12px",
                        color: palette + "contributorColor",
                      }}
                    >
                      Contributor(s):
                    </Typography>
                    <Tooltip title={result["txt_contributor"].join(", ")} arrow>
                      <Typography
                        sx={{
                          fontSize: "12px",
                          color: palette + "contributorColor",
                          backgroundColor: palette + "bgContributor",
                          fontWeight: 700,
                          padding: "0 4px",
                          borderRadius: 1,
                        }}
                      >
                        {cutWithDots(result["txt_contributor"].join(", "), 25)}
                      </Typography>
                    </Tooltip>
                  </Box>
                )}
                {"indexed_ts" in result && (
                  <>
                    {translationState.translation["Indexed through ODIS"] +
                      " " +
                      formatDate(result["indexed_ts"])}
                  </>
                )}
              </Typography>
              <Button
                startIcon={iconLD}
                variant="contained"
                disableElevation
                sx={{
                  borderRadius: 2,
                  fontWeight: 700,
                  backgroundColor: palette + "bgViewJson",
                  textTransform: "none",
                  color: palette + "colorViewJson",
                  "&:hover": {
                    color: "#ffffff",
                  },
                }}
                href={`${dataServiceUrl}/source?${jsonLdParams}`}
                onClick={() =>
                  sendMatomoEvent(
                    "click_on_jsonld",
                    `${dataServiceUrl}/source?${jsonLdParams}`
                  )
                }
                onAuxClick={() =>
                  sendMatomoEvent(
                    "click_on_jsonld",
                    `${dataServiceUrl}/source?${jsonLdParams}`
                  )
                }
                target="_blank"
                rel="noreferrer noopener"
                onMouseEnter={() => setIconLD(<SearchIcon />)}
                onMouseLeave={() => setIconLD(<CodeOutlinedIcon />)}
              >
                {translationState.translation["View JSONLD source"]}
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    );
  } else {
    return <></>;
  }
};

export default ResultValue;
