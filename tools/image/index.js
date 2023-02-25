const fs = require("fs").promises;
const path = require("path");

const fm = require("front-matter");
const globby = require("globby");
const Jimp = require("jimp");
const getPackageRoot = require("pkg-dir");

const loopOnPosts = async (cb) => {
  const rootDir = await getPackageRoot();
  const files = await globby("www/content/blog/*.md", {
    cwd: rootDir,
    ignore: ["**/_index.md"],
  });
  for (const file of files) {
    const content = await fs.readFile(path.resolve(rootDir, file), {
      encoding: "utf8",
    });
    const frontmatter = fm(content);
    await cb(frontmatter.attributes);
  }
};

const createBaseImage = ({ bgColor, height, width }) => {
  return new Promise((resolve, reject) => {
    new Jimp(width, height, bgColor, (err, image) => {
      if (err) {
        reject(err);
      } else {
        resolve(image);
      }
    });
  });
};

const formatName = (title) => {
  return title
    .toLowerCase()
    .replace(/\s/g, "-")
    .replace(/[^\w-]/g, "")
    .replace(/-+/g, "-");
};

(async function Main() {
  const rootDir = await getPackageRoot();

  const avatar = await Jimp.read(path.resolve(__dirname, "avatar-48.png"));

  const [font, fontSmall] = await Promise.all([
    Jimp.loadFont(Jimp.FONT_SANS_32_WHITE),
    Jimp.loadFont(Jimp.FONT_SANS_16_WHITE),
  ]);

  await loopOnPosts(async (post) => {
    const bgColor = "#192039";
    const height = 290;
    const width = 516;

    const image = await createBaseImage({ bgColor, height, width });

    image.composite(avatar, 10, 10);
    image.print(fontSmall, 48 + 24, 24, "Bruno Scopelliti");

    image.print(
      font,
      /* x */ 0,
      /* y */ 116,
      {
        text: post.title.replace("“", '"').replace("”", '"'),
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
      },
      width
    );

    image.write(
      path.resolve(
        rootDir,
        "www/static/images/post-cards",
        formatName(post.title) + ".png"
      )
    );
  });

  console.log("Done!");
})();
