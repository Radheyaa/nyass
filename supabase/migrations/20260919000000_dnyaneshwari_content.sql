-- Test content: Dnyaneshwari course page + Module 1 (placeholder video).
-- Body format: blank line = new block; "## " heading, "> " verse, "- " list.

insert into courses (slug, title, description, display_order)
values (
  'dnyaneshwari',
  'Dnyaneshwari',
  $desc$The Dnyaneshwari, also called the Bhavartha Dipika, is a 13th-century Marathi commentary on the Bhagavad Gita, composed around 1290 CE at Nevasa in Maharashtra by the young saint-poet Sant Dnyaneshwar (Mauli), traditionally at the age of sixteen. Rather than translating the Sanskrit line by line, he unfolds its meaning in flowing ovi verses, rich with everyday images of the sea, the lamp and a mother's love, so that ordinary people could receive the highest wisdom in their own language.

Across eighteen chapters the work travels from Arjuna's crisis of conscience to the freedom of the Self: how to act without clinging to results, how to love and surrender, and how to see the one Reality behind all things. Its warmth and lyrical beauty have made it the cornerstone of the Varkari tradition and one of the most cherished works in Marathi literature.

In this course you will study the Dnyaneshwari chapter by chapter, in short, focused modules that pair a guided reading of the key ovis with video and reflection questions you can apply to daily life.$desc$,
  1
)
on conflict (slug) do update set description = excluded.description;

insert into modules (course_id, title, content_type, video_url, body, display_order)
select
  c.id,
  'Arjunavishada Yoga: Arjuna''s Despondency',
  'video',
  'https://www.youtube.com/watch?v=e2OKXv4wtTg&t=45s',
  $body$In the very first chapter, Dnyaneshwar sets the stage for the entire Gita. Before any teaching begins, we meet a human being at breaking point: Arjuna, the greatest archer of his age, standing between two armies on the field of Kurukshetra and unable to lift his bow.

The chapter opens not with the battlefield but with a prayer. Dnyaneshwar bows to the Absolute, to Ganesha as the embodiment of understanding, to Sharada as the goddess of speech, and to his guru and elder brother Nivruttinath, from whom he received the teaching. The very first ovi reads:

> ॐ नमोजी आद्या । वेदप्रतिपाद्या । जय जय स्वसंवेद्या । आत्मरूपा ॥ १ ॥

Salutations to the Primal One, whom the Vedas proclaim and who is known only through direct experience: the Self.

The scene then moves to the palace at Hastinapur. The blind king Dhritarashtra asks his minister Sanjaya what his sons and the Pandavas are doing, gathered at the field of dharma. Sanjaya, gifted with divine sight, describes the great armies, their commanders and the conch shells sounding the call to war.

Then comes the turning point. Arjuna asks Krishna, his charioteer, to draw the chariot between the two armies, and sees teachers, cousins, uncles and friends on both sides. His limbs weaken, his mouth dries and his bow slips from his hand. He fears that a victory won at the cost of his own family would be no victory at all, and he sits down in despair.

## Key ideas

- The teaching begins where a real problem begins: in confusion, grief and moral conflict, not in abstract theory.
- Arjuna's despondency (vishada) is a doorway, not a failing. Only someone honestly troubled is ready to ask the deeper question.
- Dnyaneshwar offers the whole work as service, giving the Gita's wisdom to ordinary people in their own language.

## Reflect

Think of a moment when duty and affection pulled you in opposite directions. What did you do, and what do you wish you had known?$body$,
  1
from courses c
where c.slug = 'dnyaneshwari'
  and not exists (
    select 1 from modules m where m.course_id = c.id and m.display_order = 1
  );
