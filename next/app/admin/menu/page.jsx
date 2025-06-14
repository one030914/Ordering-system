"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function MenuManagementPage() {
    const [menuItems, setMenuItems] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newItem, setNewItem] = useState({
        name: "",
        description: "",
        price: 0,
        imageUrl: "",
        isAvailable: true,
    });
    const [editingId, setEditingId] = useState(null);
    const [editItem, setEditItem] = useState({});
    const [imageFile, setImageFile] = useState(null);
    const [imageUrl, setImageUrl] = useState("");

    useEffect(() => {
        const getMenu = async () => {
            const response = await fetch("/api/menu");
            if (!response.ok) {
                alert("取得菜單失敗");
                return;
            }
            const data = await response.json();
            setMenuItems(data);
        };
        getMenu();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const itemToSend = {
                ...newItem,
                price: parseFloat(newItem.price),
            };

            const response = await fetch("/api/menu", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(itemToSend),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText);
            }
            const data = await response.json();
            setMenuItems((prev) => [...prev, data]);
            setNewItem({
                name: "",
                description: "",
                price: 0,
                imageUrl: "",
                isAvailable: true,
            });
            setIsCreating(false);
        } catch (error) {
            console.error("發生錯誤:", error.message);
        }
    };

    const handleImageUpload = async () => {
        if (!imageFile) return;

        const formData = new FormData();
        formData.append("file", imageFile);

        try {
            const response = await fetch("/api/image/upload", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "圖片上傳失敗");
            }

            setImageUrl(data.url);
            setNewItem((prev) => ({ ...prev, imageUrl: data.url }));
        } catch (err) {
            console.error("圖片上傳失敗:", err.message);
            return;
        }
    };

    const startEditing = (item) => {
        setEditingId(item.id);
        setEditItem({
            name: item.name,
            description: item.description,
            price: item.price,
            imageUrl: item.imageUrl || "",
            isAvailable: item.isAvailable,
        });
    };

    const handleEdit = async (menuId) => {
        try {
            const updatedItemToSend = {
                ...editItem,
                price: parseFloat(editItem.price),
            };

            const response = await fetch(`/api/menu/${menuId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedItemToSend),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText);
            }
            const updatedItem = await response.json();

            setMenuItems((prev) =>
                prev.map((item) => (item.id === menuId ? updatedItem : item))
            );
            setEditingId(null);
        } catch (error) {
            console.error("更新失敗:", error.message);
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditItem({});
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-100 via-pink-100 to-red-100 px-4 sm:px-8 py-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <h1 className="text-3xl font-bold text-gray-800 text-center sm:text-left">
                        🍱 菜單管理
                    </h1>
                    <button
                        onClick={() => {
                            setImageFile(null);
                            setImageUrl("");
                            setIsCreating(true);
                        }}
                        className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-6 py-2 rounded-md shadow hover:opacity-90 transition w-full sm:w-auto"
                    >
                        新增菜單
                    </button>
                </div>

                {isCreating && (
                    <div className="bg-white p-6 rounded-lg shadow-lg mb-10">
                        <h2 className="text-xl font-semibold mb-4">新增餐點</h2>
                        <form
                            onSubmit={handleCreate}
                            className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        >
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">
                                    名稱
                                </label>
                                <input
                                    type="text"
                                    value={newItem.name}
                                    onChange={(e) =>
                                        setNewItem({
                                            ...newItem,
                                            name: e.target.value,
                                        })
                                    }
                                    className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-400"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">
                                    價格
                                </label>
                                <input
                                    type="number"
                                    value={newItem.price}
                                    onChange={(e) =>
                                        setNewItem({
                                            ...newItem,
                                            price: parseFloat(e.target.value),
                                        })
                                    }
                                    className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-400"
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block mb-1 text-sm font-medium text-gray-700">
                                    描述
                                </label>
                                <textarea
                                    value={newItem.description}
                                    onChange={(e) =>
                                        setNewItem({
                                            ...newItem,
                                            description: e.target.value,
                                        })
                                    }
                                    className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-400"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    圖片上傳
                                </label>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) =>
                                            setImageFile(e.target.files[0])
                                        }
                                        className="flex-1 text-sm text-gray-700 file:mr-4 file:py-2 file:px-4
                                                   file:rounded-full file:border-0
                                                   file:text-sm file:font-semibold
                                                   file:bg-blue-50 file:text-blue-700
                                                   hover:file:bg-blue-100"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleImageUpload}
                                        disabled={!imageFile}
                                        className={`px-4 py-2 text-white rounded transition
                                        ${
                                            imageFile
                                                ? "bg-blue-600 hover:bg-blue-700"
                                                : "bg-gray-400 cursor-not-allowed"
                                        }`}
                                    >
                                        上傳圖片
                                    </button>
                                </div>
                            </div>

                            {imageUrl && (
                                <div className="mt-4">
                                    <p className="text-sm text-gray-600">
                                        圖片預覽：
                                    </p>
                                    <Image
                                        src={imageUrl}
                                        width={400}
                                        height={300}
                                        alt="預覽"
                                        className="mt-2 w-full max-h-64 object-contain rounded-lg border"
                                    />
                                    <input
                                        type="text"
                                        className="mt-2 w-full border px-3 py-2 rounded bg-gray-50"
                                        value={imageUrl}
                                        readOnly
                                    />
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-4 md:col-span-2">
                                <button
                                    type="submit"
                                    className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-4 py-2 rounded-md shadow hover:opacity-90 transition"
                                >
                                    新增
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsCreating(false)}
                                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                                >
                                    取消
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {menuItems.map((item) =>
                        editingId === item.id ? ( // 編輯模式的表單
                            <div
                                key={item.id}
                                className="bg-white rounded-xl shadow-lg p-5 relative"
                            >
                                <h3 className="text-lg font-bold text-gray-800 mb-4">
                                    編輯餐點
                                </h3>
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        handleEdit(item.id);
                                    }}
                                    className="space-y-4"
                                >
                                    <label className="block mb-1 ms-2 font-medium text-gray-700">
                                        名稱
                                    </label>
                                    <input
                                        type="text"
                                        value={editItem.name}
                                        onChange={(e) =>
                                            setEditItem({
                                                ...editItem,
                                                name: e.target.value,
                                            })
                                        }
                                        className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-400"
                                        required
                                        placeholder="名稱"
                                    />
                                    <label className="block mb-1 ms-2 font-medium text-gray-700">
                                        價格
                                    </label>
                                    <input
                                        type="number"
                                        value={editItem.price}
                                        onChange={(e) =>
                                            setEditItem({
                                                ...editItem,
                                                price: parseFloat(
                                                    e.target.value
                                                ),
                                            })
                                        }
                                        className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-400"
                                        required
                                        placeholder="價格"
                                    />
                                    <label className="block mb-1 ms-2 font-medium text-gray-700">
                                        敘述
                                    </label>
                                    <textarea
                                        value={editItem.description}
                                        onChange={(e) =>
                                            setEditItem({
                                                ...editItem,
                                                description: e.target.value,
                                            })
                                        }
                                        className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-400"
                                        placeholder="描述"
                                    />
                                    <label className="block mb-1 ms-2 font-medium text-gray-700">
                                        圖片URL
                                    </label>
                                    <input
                                        type="text"
                                        value={editItem.imageUrl}
                                        onChange={(e) =>
                                            setEditItem({
                                                ...editItem,
                                                imageUrl: e.target.value,
                                            })
                                        }
                                        className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-400"
                                        placeholder="圖片 URL"
                                    />
                                    <label className="inline-flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={editItem.isAvailable}
                                            onChange={(e) =>
                                                setEditItem({
                                                    ...editItem,
                                                    isAvailable:
                                                    e.target.checked,
                                                })
                                            }
                                        />
                                        <span>供應中</span>
                                    </label>
                                    <div className="flex gap-4">
                                        <button
                                            type="submit"
                                            className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-4 py-2 rounded-md shadow hover:opacity-90 transition"
                                        >
                                            儲存
                                        </button>
                                        <button
                                            type="button"
                                            onClick={cancelEdit}
                                            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                                        >
                                            取消
                                        </button>
                                    </div>
                                </form>
                            </div> // 顯示模式的菜單卡片
                        ) : (
                            <div
                                key={item.id}
                                className="bg-white rounded-xl shadow-lg p-5 hover:shadow-xl transition relative"
                            >
                                {item.imageUrl ? (
                                    <Image
                                        src={item.imageUrl}
                                        alt={item.name}
                                        width={400}
                                        height={250}
                                        className="rounded-md w-full h-48 object-cover mb-4"
                                    />
                                ) : (
                                    <div className="flex justify-center items-center rounded-md w-full h-48 object-cover mb-4">
                                        無圖片
                                    </div>
                                )}

                                <h3 className="text-lg font-bold text-gray-800 mb-1">
                                    {item.name}
                                </h3>
                                <p className="text-sm text-gray-600 mb-2 line-clamp-3">
                                    {item.description}
                                </p>
                                <div className="flex flex-wrap justify-between items-center gap-2">
                                    <span className="text-pink-600 font-semibold text-lg">
                                        ${item.price.toFixed(2)}
                                    </span>
                                    <span
                                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                                            item.isAvailable
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-700"
                                        }`}
                                    >
                                        {item.isAvailable ? "供應中" : "已下架"}
                                    </span>
                                </div>
                                <button
                                    onClick={() => startEditing(item)}
                                    className="absolute top-3 right-3 px-3 py-1.5 bg-gradient-to-r from-pink-500 to-red-600 text-white text-sm rounded-lg shadow-md hover:from-pink-600 hover:to-red-700 hover:shadow-lg transition duration-300 ease-in-out"
                                >
                                    編輯
                                </button>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
