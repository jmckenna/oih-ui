export const reducer = (state, action) => {
  switch (action.type) {
    case "setBaseLayer":
      return {
        ...state,
        baseLayer: action.baseLayer,
      };
    case "setClustering":
      return {
        ...state,
        clustering: action.clustering,
      };
    case "setHexOpacity":
      return {
        ...state,
        hexOpacity: action.hexOpacity,
      };
    case "setHeatOpacity":
      return {
        ...state,
        heatOpacity: action.heatOpacity,
      };
    case "setBaseOpacity":
      return {
        ...state,
        baseOpacity: action.baseOpacity,
      };
    case "setShowPoints":
      return {
        ...state,
        showPoints: action.showPoints,
      };
    case "setShowRegions":
      return {
        ...state,
        showRegions: action.showRegions,
      };
    case "setZoom":
      return {
        ...state,
        zoom: action.zoom,
      };
    case "setLoading":
      return {
        ...state,
        loading: action.loading,
      };
    case "setCenter":
      return {
        ...state,
        center: action.center,
      };
    case "setShowSearchArea":
      return {
        ...state,
        showSearchArea: action.showSearchArea,
      };

    case "setSelectedElem":
      return {
        ...state,
        selectedElem: action.selectedElem,
      };
    case "setMapBounds":
      return {
        ...state,
        mapBounds: action.mapBounds,
      };
    default:
      break;
  }
};
