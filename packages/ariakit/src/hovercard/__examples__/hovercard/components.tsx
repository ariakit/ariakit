import { Button } from "ariakit/button";

const tweet = {
  name: "The A11Y Project",
  username: "@A11YProject",
  bio: "A community-driven effort to make digital accessibility easier. #a11y",
  date: "Dec 13",
  avatar: {
    url: "https://pbs.twimg.com/profile_images/1282181187184754688/zr1yW3wE_400x400.png",
    alt: "The A11Y Project",
  },
  text: "I’m hoping that this article will get others thinking about UX Design from different cognitive perspectives.",
  followingCount: "396",
  folloowersCount: "12.3k",
} as const;

export function Content({ data = tweet }) {
  return (
    <div className="content">
      <p className="content-profile">
        <strong>{data.name}</strong> {data.username} · {data.date}
      </p>
      <p className="content-content">{data.text}</p>
    </div>
  );
}

export function Avatar({ data = tweet.avatar }) {
  return (
    <div className="avatar">
      <img src={data.url} alt={data.alt} className="avatar-img" />
    </div>
  );
}
export function Profile({ data = tweet }) {
  return (
    <>
      <div className="profile">
        <Avatar />
        <div>
          <Button className="button">Follow</Button>
        </div>
      </div>
      <div>
        <p className="profile-name">{data.name}</p>
        <p className="prifile-username">{data.username}</p>
      </div>
      <p>{data.bio}</p>
      <div className="profile-details">
        <a href="#" title={`${data.followingCount} Following`}>
          <strong>{data.followingCount}</strong> Following
        </a>
        <a href="#" title={`${data.followingCount} Followers`}>
          <strong>{data.followingCount}</strong> Followers
        </a>
      </div>
    </>
  );
}
