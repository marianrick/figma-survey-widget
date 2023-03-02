// This is a counter widget with buttons to increment and decrement the number.
const { widget } = figma;
const {
  useSyncedState,
  useSyncedMap,
  usePropertyMenu,
  useWidgetId,
  AutoLayout,
  Text,
  SVG,
  Input,
  Line,
  useEffect,
  Image,
} = widget;

const pluginWidth = 595;
const pluginPadding = 30;
const pluginContentWidth = pluginWidth - pluginPadding * 2;
const tickSize = 40;
const tickSpacing = (pluginContentWidth - tickSize * 10) / 9;

function Widget() {
  const [answers, setAnswers] = useSyncedState<string[]>("answers", [
    "Wir tun nichts",
  ]);
  const [newAnswer, setNewAnswer] = useSyncedState<string>("newAnswer", "");

  const userIdByUser = useSyncedMap<User>("users");

  console.log({ users: userIdByUser.entries() });

  return (
    <AutoLayout
      direction={"vertical"}
      cornerRadius={8}
      fill={"#FFFFFF"}
      stroke={"#E6E6E6"}
    >
      <AutoLayout direction={"vertical"} spacing={30} padding={pluginPadding}>
        <Title />
        {answers.map((answer) => (
          <Answer
            key={answer}
            userIdByUser={userIdByUser}
            removeAnswer={() => {
              setAnswers((previousAnswers) =>
                previousAnswers.filter((a) => a !== answer)
              );
            }}
            onVote={() => {
              if (
                figma?.currentUser?.id != null &&
                !userIdByUser.get(figma.currentUser.id)
              ) {
                userIdByUser.set(figma.currentUser.id, figma.currentUser);
              }
            }}
          >
            {answer}
          </Answer>
        ))}
      </AutoLayout>
      <Line length={pluginWidth} stroke={"#e6e6e6"} />
      <AutoLayout
        verticalAlignItems={"center"}
        spacing={10}
        fill="#f5f5f5"
        padding={{ horizontal: pluginPadding, vertical: 20 }}
        width={pluginWidth}
      >
        <Input
          value={newAnswer}
          placeholder="Variante eingeben"
          onTextEditEnd={(e) => {
            setNewAnswer(e.characters);
          }}
          inputBehavior="wrap"
          inputFrameProps={{
            fill: "#f5f5f5",
            stroke: "#9747ff",
            cornerRadius: 8,
            padding: { vertical: 15, horizontal: 15 },
          }}
          width={pluginContentWidth - 190}
        />
        <AutoLayout
          direction={"vertical"}
          verticalAlignItems={"center"}
          padding={{ vertical: 15, horizontal: 15 }}
          cornerRadius={8}
          fill={"#9747ff"}
          onClick={() => {
            setAnswers((p) => [...p, newAnswer]);
            setNewAnswer("");
            console.log(figma?.currentUser);
          }}
          width={190}
        >
          <Text fill="#ffffff" fontWeight="bold">
            Variante hinzufügen
          </Text>
        </AutoLayout>
      </AutoLayout>
    </AutoLayout>
  );
}

widget.register(Widget);

function Answer({
  children,
  removeAnswer,
  onVote,
  userIdByUser,
}: {
  children: string;
  removeAnswer: any;
  onVote: any;
  userIdByUser: SyncedMap<User>;
}) {
  const voteMap = useSyncedMap<number>(`${children}ToVote`);
  console.log({
    entries: voteMap.entries(),
    values: voteMap.values(),
    keys: voteMap.keys(),
  });

  const voteCount = voteMap.keys().length;
  const voteSize = voteMap.values().reduce((a, b) => a + b, 0);
  const average =
    voteCount < 1 ? 0 : Math.round((voteSize / voteCount) * 100) / 100;

  return (
    <AutoLayout direction="vertical" spacing={10}>
      <AutoLayout spacing={10}>
        <Text fontSize={24} width={pluginContentWidth - 10 - 65}>
          {children}
        </Text>
        {removeAnswer != null && (
          <AutoLayout
            onClick={() => {
              removeAnswer();
            }}
          >
            <Text fill="#f24822">Löschen</Text>
          </AutoLayout>
        )}
      </AutoLayout>
      <AutoLayout spacing={tickSpacing}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((e) => {
          const belowAverage = e <= Math.round(average);
          return (
            <AutoLayout
              key={`answer-children-${e}`}
              width={tickSize}
              height={tickSize}
              stroke="#9747ff"
              fill={belowAverage ? "#9747ff" : "#ffffff"}
              strokeWidth={2}
              horizontalAlignItems="center"
              verticalAlignItems="center"
              cornerRadius={40}
              onClick={() => {
                if (figma?.currentUser?.id == null) {
                  return;
                }
                voteMap.set(figma.currentUser.id, e);
                onVote();
              }}
            >
              <Text
                fill={belowAverage ? "#ffffff" : "#9747ff"}
                fontWeight="bold"
              >
                {e}
              </Text>
            </AutoLayout>
          );
        })}
      </AutoLayout>
      <AutoLayout spacing={10} verticalAlignItems="center" height={32}>
        {voteCount > 0 && (
          <AutoLayout spacing={-5} verticalAlignItems="center">
            {voteMap.keys().map((voteId) => {
              const user = userIdByUser.get(voteId);
              if (user == null) {
                return null;
              }

              if (!user.photoUrl) {
                return (
                  <AutoLayout
                    key={voteId}
                    width={32}
                    height={32}
                    stroke="#FFFFFF"
                    strokeWidth={1}
                    fill={user.color}
                    cornerRadius={32}
                    verticalAlignItems="center"
                    horizontalAlignItems="center"
                  >
                    <Text fill="#ffffff" fontWeight="bold">
                      {user.name.slice(0, 1)}
                    </Text>
                  </AutoLayout>
                );
              }

              return (
                <Image
                  key={voteId}
                  src={user.photoUrl}
                  width={32}
                  height={32}
                  cornerRadius={32}
                  stroke="#FFFFFF"
                  strokeWidth={1}
                />
              );
            })}
          </AutoLayout>
        )}
        <Text fill={{ r: 0, g: 0, b: 0, a: 0.5 }}>
          Avg:{" "}
          {voteCount < 1 ? 0 : Math.round((average / voteCount) * 100) / 100}
        </Text>
        <Text fill={{ r: 0, g: 0, b: 0, a: 0.5 }}>Votes: {voteCount}</Text>
      </AutoLayout>
    </AutoLayout>
  );
}

function Title() {
  const [question, setQuestion] = useSyncedState<string>(
    "question",
    "Wie hoch ist dein Widerstand für die folgenden Lösungen?"
  );
  return (
    <Input
      width={pluginContentWidth}
      value={question}
      placeholder="asdsad"
      onTextEditEnd={(e) => {
        setQuestion(e.characters);
      }}
      fontSize={32}
      fontWeight="bold"
      inputBehavior="wrap"
    />
  );
}
