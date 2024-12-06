import { useNavigate } from "react-router-dom";
import { DotLoader } from "react-spinners";
import { useDispatch, useSelector } from "react-redux";
import { collection, doc, setDoc } from "firebase/firestore";

import ProductCard from "../../components/productCard/ProductCard";
import { db } from "../../configs/firebase";
import { userSelector } from "../../redux/reducers/userReducer";
import {
  ordersActions,
  ordersSelector,
} from "../../redux/reducers/ordersReducer";
import { cartActions, cartSelector } from "../../redux/reducers/cartReducer";
import { showNotification } from "../../utility/showNotifications";

const Cart = () => {
  const { cart, loading } = useSelector(cartSelector);
  const { orders } = useSelector(ordersSelector);
  const { userUid } = useSelector(userSelector);
  
  const total = cart.reduce((acc, item) => acc + item.qty * item.price, 0);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const resetCartPage = async () => {
    dispatch(cartActions.reset());

    const usersCartsRef = collection(db, "usersCarts");
    await setDoc(doc(usersCartsRef, userUid), {
      cart: [],
    });
  };

  const purchaseProductsFromCart = async (cart) => {
    if (!userUid) {
      showNotification("Please Sign in or Sign up to purchase products.");
      navigate("/signin");
      return;
    }

    showNotification("Orders Purchased Successfully!");

    const orderToPlace = {
      id: new Date().getTime(),
      orderedOn: new Date().toISOString().split("T")[0],
      products: [...cart],
      totalPrice: total,
    };

    const newOrders = [orderToPlace, ...orders];

    dispatch(ordersActions.replaceOrders(newOrders));

    const usersOrdersRef = collection(db, "usersOrders");
    await setDoc(doc(usersOrdersRef, userUid), {
      orders: newOrders,
    });

    resetCartPage();
  };

  if (loading) {
    return (
      <div className="pageLoader flex-1 flex items-center justify-center">
        <DotLoader
          color="#7064e5"
          size={70}
          aria-label="Loading Spinner"
          data-testid="loader"
        />
      </div>
    );
  }
  
  if (cart.length === 0) {
    return (
      <div className="text-center text-xl m-4 dark:text-white">
        <h2>Cart is Empty!</h2>
      </div>
    );
  }

  return (
    <div>
      <aside className="flex justify-center align-center flex-col h-40 rounded-xl align-center fixed w-48 bg-zinc-100 dark:bg-neutral-800 p-4 gap-8 top-1/3 -left-40 md:left-0 transition-all duration-500 hover:left-0 text-violet-600 border border-violet-600 dark:border-violet-400 dark:text-violet-400">
        <h2 className="text-lg font-bold">Total Price:- {total}</h2>
        <button
          className="ease-in-out duration-300 h-9 text-lg rounded-md dark:text-black dark:hover:text-white text-white bg-violet-600 dark:bg-violet-400 border-violet-600 dark:border-violet-400 border-2 hover:text-violet-600  hover:bg-white dark:hover:bg-black mx-auto w-full"
          onClick={(e) => {
            e.preventDefault();

            purchaseProductsFromCart(cart);
            navigate("/myorders");
          }}
        >
          Purchase
        </button>
      </aside>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 ml-16 md:ml-56 py-9 pr-4">
        {cart.map((product) => {
          return (
            <ProductCard key={product.id} product={product} homeOrCart="cart" />
          );
        })}
      </div>
    </div>
  );
};

export default Cart;
