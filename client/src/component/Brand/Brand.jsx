import React, { useEffect, useState } from "react";
import "./Brand.css";
import Slider from "react-slick";
import BrandAPI from "../APIclone/BrandAPI";
import axios from "axios";
const Brand = () => {
  const [brands, setBrands] = useState([]);
  var settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 3,
  };

  useEffect(() => {
    const fetchBrand = async () => {
      try {
        const headers = {
          "Content-Type": "application/json",
        };
        const response = await axios.get(
          " http://localhost:3030/api/v1/p/brands",
          { headers }
        );
        setBrands(response.data.metadata.brands);
      } catch (error) {
        console.error("Lỗi khi lấy dữ", error);
      }
    };

    fetchBrand();
  }, []);

  return (
    <div>
      <div className="brandSection">
        <div className="container-fluid brandSectionCtn">
          <div className="brandSectionCtn1">
            <h2 className="hd">Top cửa hàng được tin dùng</h2>
            <ul className="list list-inline ml-auto filterTab">
              <li className="list-inline-item">
                <a href="">Tất cả</a>
              </li>
              <li className="list-inline-item">
                <a href="">Thời trang</a>
              </li>
              <li className="list-inline-item">
                <a href="">Điện thoại</a>
              </li>
              <li className="list-inline-item">
                <a href="">Laptop</a>
              </li>
              <li className="list-inline-item">
                <a href="">Giày dép</a>
              </li>
              <li className="list-inline-item">
                <a href="">Thực phẩm</a>
              </li>
              <li className="list-inline-item">
                <a href="">Đồng hồ</a>
              </li>
            </ul>
          </div>
          <div className="row">
            <div className="col-3">
              <div className="BrandMain-ads">
                <h1>Tiêu chí dựa vào thương hiệu và đánh giá từ khách hàng </h1>
                <p>Khám phá ngay</p>
                <img src="/IMG/Home/Brand.png" alt="" />
              </div>
            </div>

            <div className="col-9 ">
              <Slider {...settings} className="BrandMain">
                {brands.map((item) => {
                  return (
                    <div className="item" key={item._id}>
                      <img src={item.image_url} alt="" />
                      <div className="BrandCtn">
                        <h1>{item.name}</h1>
                        <p>Shop now</p>
                      </div>
                    </div>
                  );
                })}
              </Slider>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Brand;
