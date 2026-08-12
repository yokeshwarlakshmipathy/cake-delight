import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Cakes from "./pages/Cakes";
import CakeDetails from "./pages/CakeDetails";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<Cakes />}
        />

        <Route
          path="/cakes"
          element={<Cakes />}
        />

        <Route
          path="/cakes/:id"
          element={<CakeDetails />}
        />

        <Route
          path="/cart"
          element={<Cart />}
        />

        <Route
          path="/orders"
          element={<Orders />}
        />
        <Route
          path="/orders/:id"
          element={<OrderDetails />}
        />
        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;