import { Button } from "@radix-ui/themes";
import { useNavigate } from "react-router";

function App() {
  const navigate = useNavigate();

  return (
    <h1>
      <Button
        color="iris"
        onClick={() => {
          navigate("/download");
        }}
      >
        Download
      </Button>
      <Button
        color="jade"
        onClick={() => {
          navigate("/upload");
        }}
      >
        Upload
      </Button>
    </h1>
  );
}

export default App;
