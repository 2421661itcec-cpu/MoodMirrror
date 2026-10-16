// EDIT ME. g = gender of the performer/character: "m", "f", or "x" (matches anyone).
// Add images to assets/ref/ (only ones you have rights to). VERIFY each `expr` label against the image you use.
export const EXPRS=["happy","sad","angry","surprised","neutral","fearful","disgusted"];
export const EMOJI={happy:"😄",sad:"😢",angry:"😠",surprised:"😲",neutral:"😐",fearful:"😨",disgusted:"🤢"};
const B=(name,g,expr,file,line)=>({name,g,series:"Bollywood",expr,img:"assets/ref/"+file,line});
const A=(name,series,g,expr,file,line)=>({name,g,series,expr,img:"assets/ref/"+file,line});
export const BOLLY=[
 B("Shah Rukh Khan","m","happy","srk-happy.jpg","Open-arms, main-character smile energy!"),
 B("Ranveer Singh","m","surprised","ranveer-surprised.jpg","Wide-eyed and full of drama!"),
 B("Aamir Khan","m","sad","aamir-sad.jpg","Deep, thoughtful, emotional."),
 B("Salman Khan","m","angry","salman-intense.jpg","Action-hero intensity."),
 B("Hrithik Roshan","m","neutral","hrithik-neutral.jpg","Calm, cool, mysterious."),
 B("Hrithik Roshan","m","fearful","hrithik-fear.jpg","Thriller-scene suspense!"),
 B("Ranveer Singh","m","disgusted","ranveer-disgust.jpg","That dramatic 'ew' face!"),
 B("Deepika Padukone","f","happy","deepika-happy.jpg","A smile that lights up the frame."),
 B("Alia Bhatt","f","sad","alia-sad.jpg","Soft, emotional, cinematic."),
 B("Priyanka Chopra","f","angry","priyanka-intense.jpg","Intense look — boss mode."),
 B("Alia Bhatt","f","surprised","alia-surprised.jpg","Big-eyed plot-twist reaction!"),
 B("Katrina Kaif","f","neutral","katrina-neutral.jpg","Elegant and composed."),
 B("Katrina Kaif","f","fearful","katrina-fear.jpg","Edge-of-your-seat suspense!"),
 B("Kareena Kapoor","f","disgusted","kareena-disgust.jpg","That 'seriously?' face is iconic."),
 B("Kareena Kapoor","f","happy","kareena-happy.jpg","Pure Bebo-level sparkle."),
];
export const ANIME=[
 A("Naruto Uzumaki","Naruto","m","happy","naruto-happy.jpg","Believe-it grin!"),
 A("Monkey D. Luffy","One Piece","m","happy","luffy-happy.jpg","Pirate-king-sized smile."),
 A("Monkey D. Luffy","One Piece","m","surprised","luffy-surprised.jpg","Jaw-drop, rubber-style!"),
 A("Tanjiro Kamado","Demon Slayer","m","sad","tanjiro-sad.jpg","Gentle, heartfelt sadness."),
 A("Tanjiro Kamado","Demon Slayer","m","fearful","tanjiro-fear.jpg","Nervous but still brave."),
 A("Levi Ackerman","Attack on Titan","m","angry","levi-angry.jpg","Cold, sharp, intense."),
 A("Levi Ackerman","Attack on Titan","m","disgusted","levi-disgust.jpg","Cleanliness-inspector face."),
 A("Gojo Satoru","Jujutsu Kaisen","m","neutral","gojo-neutral.jpg","Effortlessly cool."),
 A("Sailor Moon","Sailor Moon","f","happy","sailor-happy.jpg","Moon-prism sparkle!"),
 A("Sailor Moon","Sailor Moon","f","surprised","sailor-surprised.jpg","Dramatic anime gasp!"),
 A("Sailor Moon","Sailor Moon","f","fearful","sailor-fear.jpg","Dramatic trembling hero vibe."),
 A("Hinata Hyuga","Naruto","f","sad","hinata-sad.jpg","Quiet, gentle emotion."),
 A("Mikasa Ackerman","Attack on Titan","f","angry","mikasa-angry.jpg","Fierce, focused, fearless."),
 A("Nezuko Kamado","Demon Slayer","f","neutral","nezuko-neutral.jpg","Calm and mysterious."),
 A("Nezuko Kamado","Demon Slayer","f","disgusted","nezuko-disgust.jpg","Unimpressed and adorable."),
 A("Pikachu","Pokémon","x","surprised","pikachu-surprised.jpg","Shocked — in a cute way."),
];
export const RECS={
 happy:["Play 'Badtameez Dil' and dance it out!","Celebration prompt: tell a friend your best news today."],
 sad:["Try an uplifting movie like 'Zindagi Na Milegi Dobara'.","Comfort playlist + chai? Sounds like a plan."],
 angry:["Take 5 slow breaths: in 4s, out 6s.","Short walk, calm music, then back to being awesome."],
 surprised:["PLOT TWIST! Something fun is coming your way.","Plot twist caption: 'Didn't see that coming.'"],
 neutral:["Chill lo-fi playlist time.","Caption: 'Mysterious main character, loading…'"],
 fearful:["Cue the suspense music — but it's just a movie!","Grab a friend and watch a comedy to shake it off."],
 disgusted:["That's a 'not for me' face. Cleanse your palate with a feel-good song.","Meme-worthy expression — screenshot it!"],
};
