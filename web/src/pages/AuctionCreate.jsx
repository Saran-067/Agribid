import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createAuction } from '../features/auctionSlice.js';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function fileToBase64(file) {
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result);
    fr.onerror = rej;
    fr.readAsDataURL(file);
  });
}

export default function AuctionCreate() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('vegetable');
  const [quantity, setQuantity] = useState('');
  const [startingPrice, setStartingPrice] = useState('');
  const [endsAt, setEndsAt] = useState(new Date());
  const [images, setImages] = useState([]);

  const dispatch = useDispatch();

  const submit = async (e) => {
    e.preventDefault();
    const base64Photos = await Promise.all(images.map(fileToBase64));
    const payload = {
      title,
      category,
      quantity,
      startingPrice: Number(startingPrice),
      endsAt: endsAt.toISOString(),
      base64Photos
    };
    const r = await dispatch(createAuction(payload));
    if (!r.error) alert('Auction created!');
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Create Auction (Farmer)</h2>
        <form onSubmit={submit} className="grid cols-2">
          <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="vegetable">Vegetable</option>
            <option value="fruit">Fruit</option>
            <option value="grain">Grain</option>
            <option value="other">Other</option>
          </select>
          <input placeholder="Quantity (e.g., 50 kg)" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          <input type="number" placeholder="Starting Price" value={startingPrice} onChange={(e) => setStartingPrice(e.target.value)} />
          
          {/* ✅ Calendar with time */}
          <DatePicker
            selected={endsAt}
            onChange={(date) => setEndsAt(date)}
            showTimeSelect
            dateFormat="Pp"
            className="datepicker-input"
          />

          <input type="file" accept="image/*" multiple onChange={(e) => setImages([...e.target.files].slice(0, 4))} />
          <button className="btn" style={{ gridColumn: '1/-1' }}>Create</button>
        </form>
      </div>
    </div>
  );
}
