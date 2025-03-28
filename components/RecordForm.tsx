import { useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db, storage } from "../lib/firebase";

export default function RecordForm() {
  const [file, setFile] = useState<File | null>(null);
  const [note, setNote] = useState("");
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    
    // 创建预览图
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleUpload = async () => {
    if (!file || note.trim() === "") {
      alert("别忘了上传照片和写观察记录哦！");
      return;
    }
    
    setUploading(true);
    try {
      // 上传图片到 Firebase Storage
      const fileRef = ref(storage, `beetle_photos/${file.name}_${Date.now()}`);
      await uploadBytes(fileRef, file);
      const photoURL = await getDownloadURL(fileRef);

      // 保存记录到 Firestore
      await addDoc(collection(db, "beetle_logs"), {
        note,
        photoURL,
        createdAt: Timestamp.now(),
      });
      
      // 重置表单
      setSuccess(true);
      setFile(null);
      setNote("");
      setPreviewUrl(null);
      
      // 3秒后隐藏成功消息
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("上传失败", err);
      alert("哎呀，上传出错了，再试一次吧！");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4 text-blue-600">📸 记录今天的发现</h2>
      
      <div className="mb-4">
        <label className="block mb-2 font-medium text-gray-700">
          选择照片 🖼️
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full p-2 border border-gray-300 rounded-lg cursor-pointer bg-gray-50"
        />
        
        {previewUrl && (
          <div className="mt-3 relative w-full h-48">
            <img
              src={previewUrl}
              alt="预览图"
              className="h-full mx-auto object-contain rounded-lg"
            />
          </div>
        )}
      </div>
      
      <div className="mb-4">
        <label className="block mb-2 font-medium text-gray-700">
          你的观察笔记 ✏️
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="今天发现独角仙..."
          className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <button
        onClick={handleUpload}
        disabled={uploading}
        className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg text-center transition-colors"
      >
        {uploading ? "正在上传..." : "保存我的观察 🚀"}
      </button>
      
      {success && (
        <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg text-center">
          <p className="flex items-center justify-center">
            <span className="text-xl mr-2">✅</span> 
            <span>太棒了！你的记录已经保存啦！</span>
          </p>
        </div>
      )}
    </div>
  );
} 