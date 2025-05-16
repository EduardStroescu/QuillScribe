import React from "react";

interface TitleSectionProps {
  title: string;
  subheading?: string;
  pill: string;
}

const TitleSection: React.FC<TitleSectionProps> = ({
  title,
  subheading,
  pill,
}) => {
  return (
    <>
      <section
        className="flex
        flex-col
        gap-4
        justify-center
        items-start
        md:items-center
        
      "
      >
        <article
          className="rounded-full
          p-[1px]
          text-sm
          bg-gradient-to-r
          from-brand-primaryBlue
          to-brand-primaryPurple
        "
        >
          <div
            className="rounded-full 
            px-3
            py-1
            bg-[#030014] text-[#cac2ff]"
          >
            {pill}
          </div>
        </article>
        {subheading ? (
          <>
            <h2
              className="text-left
              text-3xl
              sm:text-5xl
              sm:max-w-[750px]
              md:text-center
              font-semibold
              text-[#cac2ff]
            "
            >
              {title}
            </h2>
            <p
              className="text-washed-purple-700 sm:max-w-[450px]
              md:text-center
            "
            >
              {subheading}
            </p>
          </>
        ) : (
          <h1
            className=" text-left 
            text-4xl
            sm:text-6xl
            sm:max-w-[850px]
            md:text-center
            font-semibold
            text-[#cac2ff]
          "
          >
            {title}
          </h1>
        )}
      </section>
    </>
  );
};

export default TitleSection;
