import app from "./app.js";

const PORT = process.env.PORT_LOCAL ?? 5000;

app.listen(PORT, () => {
  console.log(`Server listening on PORT ${PORT}`);
});
