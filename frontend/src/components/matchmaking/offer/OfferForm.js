import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import schemaValidation from "../schemaValidation";
import Box from "@mui/material/Box";

import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";

import TextField from "@mui/material/TextField";

const OfferForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schemaValidation),
  });
  const onSubmit = (data) => console.log(data);
  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          padding: "10px",
          mt: "40px",
          mb: 2,
        }}
      >
        <Typography
          variant="body1"
          alignItems={"start"}
          textAlign="center"
          sx={{
            color: "grey",
            fontWeight: 700,
            fontSize: "22px",
          }}
        >
          Offer Form
        </Typography>
      </Box>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box
          sx={{
            padding: "40px",
            background: "#E8EDF27F",
            display: "flex",
            justifyContent: "center",
            gap: "20px",
          }}
        >
          <TextField
            {...register("firstName")}
            error={errors.firstName ? true : false}
            label="Firstname"
            variant="outlined"
            helperText={errors.firstName?.message || ""}
          />
          <TextField
            {...register("age")}
            error={errors.age ? true : false}
            label="Age"
            variant="outlined"
            helperText={errors.age?.message || ""}
          />
        </Box>
        <input type="submit" />
      </form>
    </Container>
  );
};

export default OfferForm;
