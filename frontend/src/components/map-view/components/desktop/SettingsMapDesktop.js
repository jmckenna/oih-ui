import React, { useState } from "react";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Fade from "@mui/material/Fade";
import Typography from "@mui/material/Typography";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Checkbox from "@mui/material/Checkbox";
import Divider from "@mui/material/Divider";
import Slider from "@mui/material/Slider";
import { useAppTranslation } from "context/context/AppTranslation";
import {
  HEATMAP_POINTS,
  HEATMAP_REGIONS,
  HEXAGON,
  NO_CLUSTER,
} from "components/map-view/utils/constants";

const SettingsMapDesktop = (props) => {
  const {
    openFilterMap,
    changeClustering,
    clustering,
    hexOpacity,
    changeHexOpacity,
    setShowPoints,
    setShowRegions,
    showPoints,
    showRegions,
    heatOpacity,
    changeHeatOpacity,
  } = props;
  const translationState = useAppTranslation();
  const palette = "custom.mapView.desktop.toolbar.";

  const [showClusters, setShowClusters] = useState(true);
  return (
    <Fade in={openFilterMap} mountOnEnter unmountOnExit>
      <Box
        sx={{
          backgroundColor: palette + "bgBox2",
          height: "100%",
          borderRadius: "6px",
          padding: "12px",
        }}
      >
        <Stack spacing={1}>
          <Typography variant="body2">COMPONENTS</Typography>
          <Stack spacing={2} direction={"row"}>
            <Box
              sx={{
                height: "195px",
                width: "50%",
                border: "1px solid #DEE2ED",
                borderRadius: "6px",
                padding: "12px",
              }}
            >
              <Stack spacing={2}>
                <FormControlLabel
                  control={
                    <Switch
                      size={"small"}
                      checked={showClusters}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        if (checked) {
                          setShowClusters(true);
                        } else {
                          setShowClusters(false);
                          changeClustering(NO_CLUSTER);
                        }
                      }}
                      sx={{
                        ".Mui-checked": { color: "#2B498C !important" },
                      }}
                    />
                  }
                  sx={{
                    ".MuiTypography-root": {
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#1A2C54",
                    },
                  }}
                  label={translationState.translation["Show Clustering"]}
                />
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        disabled={!showClusters}
                        checked={clustering === HEATMAP_REGIONS}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          if (checked) {
                            changeClustering(HEATMAP_REGIONS);
                          } else {
                            changeClustering(NO_CLUSTER);
                          }
                        }}
                        size="small"
                      />
                    }
                    label={translationState.translation["Heatmap"]}
                    sx={{
                      ".MuiTypography-root": {
                        fontSize: "12px",
                        color: palette + "colorTypography",
                      },
                    }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        disabled={!showClusters}
                        checked={clustering === HEXAGON}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          if (checked) {
                            changeClustering(HEXAGON);
                          } else {
                            changeClustering(NO_CLUSTER);
                          }
                        }}
                        size="small"
                      />
                    }
                    label={translationState.translation["H3 Layer"]}
                    sx={{
                      ".MuiTypography-root": {
                        fontSize: "12px",
                        color: palette + "colorTypography",
                      },
                    }}
                  />
                </Box>
                <Divider variant="middle" />

                {clustering === HEXAGON && (
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: "12px",
                        fontWeight: 700,
                        color: showClusters
                          ? palette + "colorTypography"
                          : "#DEE2ED !important",
                      }}
                    >
                      {translationState.translation["Opacity layer"]}
                    </Typography>
                    <Slider
                      disabled={!showClusters}
                      defaultValue={
                        clustering === HEXAGON ? hexOpacity : heatOpacity
                      }
                      min={0}
                      step={0.1}
                      onChangeCommitted={(e, newValue) => {
                        if (clustering === HEXAGON) changeHexOpacity(newValue);
                        else if (clustering === HEATMAP_REGIONS)
                          changeHeatOpacity(newValue);
                      }}
                      max={1}
                      valueLabelDisplay="auto"
                      sx={{
                        color: "#2B498C !important",
                        "&.Mui-disabled": {
                          color: "#DEE2ED !important",
                        },
                      }}
                    />
                  </Box>
                )}
              </Stack>
            </Box>
            <Box
              sx={{
                height: "195px",
                width: "50%",
                border: "1px solid",
                borderColor: palette + "borderColor",
                borderRadius: "6px",
                padding: "12px",
              }}
            >
              <Stack spacing={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={showPoints}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        if (checked) {
                          setShowPoints(true);
                        } else {
                          setShowPoints(false);
                        }
                      }}
                      sx={{
                        ".Mui-checked": { color: "#2B498C !important" },
                      }}
                    />
                  }
                  sx={{
                    ".MuiTypography-root": {
                      fontSize: "12px",
                      fontWeight: 700,
                      color: palette + "colorTypography",
                    },
                  }}
                  label={translationState.translation["Show Points"]}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={showRegions}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        if (checked) {
                          setShowRegions(true);
                        } else {
                          setShowRegions(false);
                        }
                      }}
                      sx={{
                        ".Mui-checked": { color: "#2B498C !important" },
                      }}
                    />
                  }
                  sx={{
                    ".MuiTypography-root": {
                      fontSize: "12px",
                      fontWeight: 700,
                      color: palette + "colorTypography",
                    },
                  }}
                  label={translationState.translation["Show Geometries"]}
                />
              </Stack>
            </Box>
          </Stack>
        </Stack>
      </Box>
    </Fade>
  );
};

export default SettingsMapDesktop;
