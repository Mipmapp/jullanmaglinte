import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const navItems = [
  { label: "ABOUT & SKILLS", active: true },
  { label: "PROJECTS", active: false },
  { label: "EXPERIENCE & CONTACT", active: false },
];

const skillsColumns = [
  ["HTML", "JavaScript", "Figma", "Canva"],
  ["CSS", "Vue.js", "TypeScript", "Git & GitHub"],
  ["Python", "CSharp", "MongoDB", "ExpressJS"],
];

const infoItems = [
  {
    icon: "/figmaAssets/frame-2.svg",
    title: "Based in",
    value: "Philippines",
  },
  {
    icon: "/figmaAssets/frame-1.svg",
    title: "Availabe for",
    value: "Freelance",
  },
];

export const HomepageFrontCard = (): JSX.Element => {
  return (
    <main className="relative w-full overflow-hidden bg-[#f3f2f2]">
      <section className="relative mx-auto min-h-[1257px] w-full min-w-[1280px] max-w-[1280px]">
        <div className="absolute bottom-[-477px] left-[467px] h-[1284px] w-[calc(100%_-_941px)] rotate-[-89.80deg] bg-[linear-gradient(270deg,rgba(153,149,149,0.5)_0%,rgba(8,8,8,0.5)_100%)] shadow-[0px_4px_4px_#00000040]" />
        <div className="absolute bottom-[-474px] left-[472px] h-[1281px] w-[calc(100%_-_945px)] rotate-[-89.80deg] bg-white shadow-[0px_4px_4px_#00000040]" />
        <Card className="absolute left-[calc(50%_-_387px)] top-[82px] h-[68px] w-[773px] rounded-[50px] border-0 bg-white shadow-[0px_4px_4px_#00000040]">
          <CardContent className="flex h-full items-center justify-between px-[39px] py-0">
            <nav aria-label="Primary" className="flex items-center gap-[46px]">
              {navItems.map((item) => (
                <Button
                  key={item.label}
                  variant="ghost"
                  className={`h-auto p-0 hover:bg-transparent ${
                    item.active ? "text-[#3145ff]" : "text-[#000000b2]"
                  } [font-family:'Sansation',Helvetica] text-[17px] font-bold tracking-[0] leading-[normal]`}
                >
                  {item.label}
                </Button>
              ))}
            </nav>
            <Button
              variant="default"
              size="icon"
              className="h-[35px] w-[35px] rounded-full border-0 bg-[#3145ff] p-0 shadow-[0px_4px_4px_#00000040] hover:bg-[#3145ff]"
              aria-label="Open menu"
            >
              <img
                className="h-5 w-auto"
                alt="Vector"
                src="/figmaAssets/vector.svg"
              />
            </Button>
          </CardContent>
        </Card>
        <div className="absolute left-[108px] top-[329px] flex h-[calc(100%_-_526px)] w-[598px] rotate-[-6.46deg] items-end justify-center rounded-[50px] bg-white shadow-[0px_4px_4px_#00000040]">
          <div className="h-[731.4px] w-[597.51px] rounded-[50px] bg-[#00000033] shadow-[0px_4px_4px_#00000040]" />
        </div>
        <div className="absolute left-[201px] top-[249px] flex h-[calc(100%_-_416px)] w-[634px] rotate-[-2.84deg] items-end justify-center rounded-[50px] bg-white shadow-[0px_4px_4px_#00000040]">
          <div className="h-[840.62px] w-[633.63px] rounded-[50px] bg-[#0000004c] shadow-[0px_4px_4px_#00000040]" />
        </div>
        <Card className="absolute bottom-[141px] left-[calc(50%_-_335px)] h-[893px] w-[669px] rounded-[50px] border-0 bg-white shadow-[0px_4px_4px_#00000040]">
          <CardContent className="p-0">
            <header>
              <div className="absolute left-[491px] top-[304px] w-[178px] whitespace-nowrap [font-family:'Sansation',Helvetica] text-[26px] font-bold tracking-[0] leading-[normal] text-[#3145ff]">
                ABOUT ME
              </div>
              <div className="absolute left-[909px] top-[257px] w-14 whitespace-nowrap [font-family:'Sansation',Helvetica] text-[32px] font-bold tracking-[0] leading-[normal] text-[#000000b2]">
                01
              </div>
              <div className="absolute left-[491px] top-[331px] w-[470px] whitespace-nowrap [font-family:'Sansation',Helvetica] text-[42px] font-bold tracking-[0] leading-[normal] text-[#000000b2]">
                Hi, I&apos;m Jullan Maglinte
              </div>
              <div className="absolute left-[calc(50%_-_295px)] top-[285px] h-32 w-32 rounded-[300px] bg-[#00000080] shadow-[0px_4px_4px_#00000040]" />
              <Button className="absolute left-[630px] top-[385px] h-auto w-[140px] rounded-[50px] bg-[#3145ff] px-3 py-[7px] shadow-[0px_4px_4px_#00000040] hover:bg-[#3145ff]">
                <img
                  className="h-5 w-5"
                  alt="Frame"
                  src="/figmaAssets/frame.svg"
                />
                <span className="[font-family:'Sansation',Helvetica] text-sm font-bold tracking-[0] leading-[normal] text-white">
                  Download CV
                </span>
              </Button>
              <img
                className="absolute left-[385px] top-[130px] h-px w-[133px]"
                alt="Line"
                src="/figmaAssets/line-6.svg"
              />
            </header>
            <div className="absolute left-[362px] top-[471px] w-[507px] [font-family:'Sansation',Helvetica] text-[27px] font-normal tracking-[0] leading-[normal] text-[#000000b2]">
              I designed and build clean, modern digital experiences.
            </div>
            <img
              className="absolute left-[361px] top-[434px] h-px w-[567px]"
              alt="Line"
              src="/figmaAssets/line-3.svg"
            />
            <div className="absolute left-[362px] top-[556px] w-[561px] [font-family:'Sansation',Helvetica] text-[21px] font-normal tracking-[0] leading-[normal] text-[#000000b2]">
              Fullstack Developer crafting clean, responsive, and modern web
              applications with attention to detail, smooth user experiences,
              and scalable backend solutions.
            </div>
            <div className="absolute left-[999px] top-[585px] flex h-[88px] w-[19px] items-end justify-end">
              <div className="mb-[36.2px] mr-[-33.8px] h-4 w-[88.26px] rotate-[89.62deg] whitespace-nowrap [font-family:'Sansation',Helvetica] text-[15px] font-bold tracking-[0] leading-[normal] text-[#00000080]">
                NEXT PAGE
              </div>
            </div>
            <img
              className="absolute left-[calc(50%_-_284px)] top-[670px] h-px w-[567px]"
              alt="Line"
              src="/figmaAssets/line-3.svg"
            />
            <img
              className="absolute left-[calc(50%_-_280px)] top-[777px] h-px w-[567px]"
              alt="Line"
              src="/figmaAssets/line-3.svg"
            />
            <img
              className="absolute left-[558px] top-[695px] h-[60px] w-px"
              alt="Line"
              src="/figmaAssets/line-4.svg"
            />
            {infoItems.map((item, index) => {
              const wrappers = [
                "absolute left-[372px] top-[704px] flex items-start gap-4",
                "absolute left-[579px] top-[704px] flex items-start gap-4",
              ];

              return (
                <div key={item.title} className={wrappers[index]}>
                  <img
                    className="mt-[5px] h-[35px] w-[37px]"
                    alt="Frame"
                    src={item.icon}
                  />
                  <div className="space-y-[2px]">
                    <div className="[font-family:'Sansation',Helvetica] text-base font-normal tracking-[0] leading-[normal] text-[#0000008c]">
                      {item.title}
                    </div>
                    <div className="[font-family:'Sansation',Helvetica] text-[17px] font-normal tracking-[0] leading-[normal] text-[#000000cc]">
                      {item.value}
                    </div>
                  </div>
                </div>
              );
            })}

            <section aria-labelledby="skills-heading">
              <h2
                id="skills-heading"
                className="absolute left-[379px] top-[803px] w-[107px] whitespace-nowrap [font-family:'Sansation',Helvetica] text-[26px] font-bold tracking-[0] leading-[normal] text-[#3145ff]"
              >
                SKILLS
              </h2>
              <div className="absolute left-[435px] top-[868px] grid grid-cols-3 gap-x-[91px] gap-y-0">
                {skillsColumns.map((column, columnIndex) => (
                  <div key={`column-${columnIndex}`} className="flex flex-col">
                    {column.map((skill, skillIndex) => (
                      <div
                        key={skill}
                        className={`[font-family:'Sansation',Helvetica] text-base font-normal tracking-[0] leading-[normal] text-[#000000e6] ${
                          skillIndex === 0
                            ? ""
                            : skillIndex === 1
                              ? "mt-[36px]"
                              : skillIndex === 2
                                ? "mt-[37px]"
                                : "mt-[36px]"
                        }`}
                      >
                        {skill}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </section>
          </CardContent>
        </Card>
        <img
          className="absolute left-[-7px] top-[922px] h-px w-[calc(100%_+_7px)]"
          alt="Line"
          src="/figmaAssets/line-5.svg"
        />
        <footer className="absolute bottom-[71px] left-[482px] w-[403px] whitespace-nowrap [font-family:'Sansation',Helvetica] text-[15px] font-bold tracking-[0] leading-[normal] text-[#00000080]">
          © 2026 Jullan Maglinte • Designed &amp; Built with Effort
        </footer>
        <Button
          variant="ghost"
          className="absolute right-[54px] top-[1136px] h-12 w-32 rounded-[50px] border-0 bg-white p-0 shadow-[0px_4px_4px_#00000040] hover:bg-white"
        >
          <span className="[font-family:'TikTok_Sans',Helvetica] text-xl font-extrabold tracking-[0] leading-[normal] text-[#000000b2]">
            CHAT
          </span>
        </Button>
        <div className="absolute left-[231px] top-[312px] w-14 rotate-[-2.74deg] whitespace-nowrap [font-family:'Sansation',Helvetica] text-[32px] font-bold tracking-[0] leading-[normal] text-[#00000066]">
          02
        </div>
        <div className="absolute left-[118px] top-[396px] w-14 rotate-[-6.75deg] whitespace-nowrap [font-family:'Sansation',Helvetica] text-3xl font-bold tracking-[0] leading-[normal] text-[#0000004c]">
          03
        </div>
      </section>
    </main>
  );
};
