"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function MenuPage() {
    const [menuItems, setMenuItems] = useState([]);
    const [cart, setCart] = useState([]);

    useEffect(() => {
        const getMenuItems = async () => {
            try {
                const response = await fetch("/api/menu");
                const data = await response.json();
                setMenuItems(data);
            } catch (err) {
                console.error(err);
            }
        };
        getMenuItems();
    }, []);

    const addToCart = (itemId) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.id === itemId);
            if (existing) {
                return prev.map((item) =>
                    item.id === itemId
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { id: itemId, quantity: 1 }];
        });
    };

    const removeFromCart = (itemId) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.id === itemId);
            if (existing && existing.quantity > 1) {
                return prev.map((item) =>
                    item.id === itemId
                        ? { ...item, quantity: item.quantity - 1 }
                        : item
                );
            }
            return prev.filter((item) => item.id !== itemId);
        });
    };

    const getCartItemCount = (itemId) => {
        return cart.find((item) => item.id === itemId)?.quantity || 0;
    };

    const getTotalItems = () => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    };

    const getTotalPrice = () => {
        return cart.reduce((total, cartItem) => {
            const menuItem = menuItems.find((item) => item.id === cartItem.id);
            return total + (menuItem?.price || 0) * cartItem.quantity;
        }, 0);
    };
    const handleCheckout = () => {
        sessionStorage.setItem("cart", JSON.stringify(cart));
        window.location.href = "/checkout";
    };
    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-100 via-pink-100 to-red-100 px-4 sm:px-6 py-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-center sm:text-left">
                    🍽 菜單
                </h1>

                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="w-full lg:w-3/4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                            {menuItems
                                .filter((item) => item.isAvailable)
                                .map((item) => (
                                    <div
                                        key={item.id}
                                        className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition"
                                    >
                                        {item.imageUrl && (
                                            <Image
                                                src={item.imageUrl}
                                                alt={item.name}
                                                width={400}
                                                height={250}
                                                className="w-full h-48 object-cover rounded-md mb-3"
                                            />
                                        )}
                                        <h3 className="font-bold text-lg text-gray-800">
                                            {item.name}
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-2">
                                            {item.description}
                                        </p>
                                        <p className="text-pink-600 font-semibold text-lg mb-2">
                                            ${item.price.toFixed(2)}
                                        </p>

                                        <div className="flex items-center justify-center sm:justify-start mt-3">
                                            <button
                                                onClick={() =>
                                                    removeFromCart(item.id)
                                                }
                                                className="bg-gray-200 px-3 py-1 rounded-l disabled:opacity-50"
                                                disabled={
                                                    getCartItemCount(
                                                        item.id
                                                    ) === 0
                                                }
                                            >
                                                -
                                            </button>
                                            <span className="bg-gray-100 px-4 py-1">
                                                {getCartItemCount(item.id)}
                                            </span>
                                            <button
                                                onClick={() =>
                                                    addToCart(item.id)
                                                }
                                                className="bg-gray-200 px-3 py-1 rounded-r"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>

                    <div className="w-full lg:w-1/4 bg-white shadow-lg rounded-lg p-5 h-fit sticky top-8">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">
                            🛒 您的訂單
                        </h2>

                        {cart.length === 0 ? (
                            <p className="text-gray-500">目前購物車是空的</p>
                        ) : (
                            <>
                                <ul className="mb-4 divide-y divide-gray-200">
                                    {cart.map((cartItem) => {
                                        const menuItem = menuItems.find(
                                            (item) => item.id === cartItem.id
                                        );
                                        if (!menuItem) return null;

                                        return (
                                            <li
                                                key={cartItem.id}
                                                className="flex justify-between py-2"
                                            >
                                                <span>
                                                    {menuItem.name} ×{" "}
                                                    {cartItem.quantity}
                                                </span>
                                                <span>
                                                    $
                                                    {(
                                                        menuItem.price *
                                                        cartItem.quantity
                                                    ).toFixed(2)}
                                                </span>
                                            </li>
                                        );
                                    })}
                                </ul>

                                <div className="border-t pt-3">
                                    <div className="flex justify-between font-bold mb-4">
                                        <span>總計：</span>
                                        <span>
                                            ${getTotalPrice().toFixed(2)}
                                        </span>
                                    </div>

                                    <button
                                        onClick={handleCheckout}
                                        className="block w-full bg-gradient-to-r from-pink-500 to-red-500 text-white text-center py-2 rounded-md hover:opacity-90 transition"
                                    >
                                        前往結帳（{getTotalItems()} 項）
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
