"use client";
import Layout from "../components/Layout";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const [articles, setArticles] = useState([]);
  const [ads, setAds] = useState([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [mainArticle, setMainArticle] = useState(null);
  const [recentArticles, setRecentArticles] = useState([]);

  useEffect(() => {
    fetchArticles();
    fetchAds();

    const rotationInterval = setInterval(() => {
      setCurrentAdIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        return nextIndex >= ads.length ? 0 : nextIndex;
      });
    }, 5000);

    return () => clearInterval(rotationInterval);
  }, [ads.length]);

  const fetchArticles = async () => {
    try {
      const response = await fetch("/api/articles");
      const data = await response.json();

      if (data.data && data.data.length > 0) {
        const sortedArticles = data.data.sort(
          (a, b) => new Date(b.publishDate) - new Date(a.publishDate)
        );
        setMainArticle(sortedArticles[0]);
        setRecentArticles(sortedArticles.slice(1, 4));
      }
    } catch (error) {
      console.error("Error fetching articles:", error);
    }
  };

  const fetchAds = async () => {
    try {
      const response = await fetch("/api/ads");
      const data = await response.json();
      setAds(data);
    } catch (error) {
      console.error("Error fetching ads:", error);
    }
  };

  const getFirstImageUrl = (content) => {
    if (!Array.isArray(content)) return null;
    const imageBlock = content.find(
      (block) => block.type === "image" && block.imageData
    );
    return imageBlock?.imageData;
  };

  const getFirstTextExcerpt = (content) => {
    if (!Array.isArray(content)) return "";
    const textBlock = content.find((block) => block.type === "text");
    const excerpt = textBlock?.text?.substring(0, 200) + "..." || "";
    return excerpt;
  };

  const getVisibleAds = () => {
    if (ads.length <= 4) return ads;
    const visibleAds = [];
    for (let i = 0; i < 4; i++) {
      const index = (currentAdIndex + i) % ads.length;
      visibleAds.push(ads[index]);
    }
    return visibleAds;
  };

  return (
    <Layout>
      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2">
          {mainArticle ? (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
              <Link href={`/articles/${mainArticle._id}`}>
                <div className="p-4">
                  <h3 className="text-2xl font-bold mb-4">
                    {mainArticle.title}
                  </h3>
                  {getFirstImageUrl(mainArticle.content) && (
                    <div className="relative w-full h-64 mb-4">
                      <img
                        src={`data:${
                          getFirstImageUrl(mainArticle.content).contentType
                        };base64,${
                          getFirstImageUrl(mainArticle.content).base64Data
                        }`}
                        alt={mainArticle.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <p className="text-gray-700">
                    {getFirstTextExcerpt(mainArticle.content)}
                  </p>
                  <p className="text-gray-500 mt-2">By {mainArticle.author}</p>
                </div>
              </Link>
            </div>
          ) : (
            <div>Loading main article...</div>
          )}

          <h2 className="text-2xl font-bold mb-4">Latest Content</h2>
          <div className="space-y-4">
            {recentArticles.map((article) => (
              <Link
                href={`/articles/${article._id}`}
                key={article._id}
                className="block bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="p-4">
                  <h3 className="text-xl font-bold mb-2">{article.title}</h3>
                  <p className="text-gray-700">
                    {getFirstTextExcerpt(article.content)}
                  </p>
                  <p className="text-gray-500 mt-2">By {article.author}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">
            We appreciate our partners in the Arts community
          </h2>
          <div className="space-y-4 relative transition-all duration-500 ease-in-out">
            {getVisibleAds().map((ad) => (
              <a
                key={ad._id}
                href={ad.externalLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
              >
                {ad.imageData && (
                  <img
                    src={`data:${ad.imageData.contentType};base64,${ad.imageData.base64Data}`}
                    alt={ad.title}
                    className="w-full h-32 object-cover"
                  />
                )}
                <div className="p-2">
                  <h3 className="font-semibold">{ad.title}</h3>
                </div>
              </a>
            ))}
            {ads.length > 4 && (
              <div className="flex justify-center space-x-2 mt-4">
                {Array.from({ length: Math.ceil(ads.length / 4) }).map(
                  (_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentAdIndex(idx * 4)}
                      className={`w-2 h-2 rounded-full ${
                        Math.floor(currentAdIndex / 4) === idx
                          ? "bg-blue-500"
                          : "bg-gray-300"
                      }`}
                      aria-label={`Go to ad set ${idx + 1}`}
                    />
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
