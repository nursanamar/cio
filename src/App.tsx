import { useEffect, useRef, useState } from 'react'
import { initializeApp } from "firebase/app";
import { DatabaseReference, get, getDatabase, onValue, ref, set } from "firebase/database";
import { Button, Card, Center, Container, Group, Stack, Text } from '@mantine/core';
import { useStopwatch } from 'react-timer-hook';

const firebaseConfig = {
  apiKey: "AIzaSyBZs2TNeY_hmmzIPidsbQefYZ_IYkSKH_g",
  authDomain: "monitoring-774d5.firebaseapp.com",
  databaseURL: "https://monitoring-774d5-default-rtdb.firebaseio.com",
  projectId: "monitoring-774d5",
  storageBucket: "monitoring-774d5.appspot.com",
  messagingSenderId: "982725767484",
  appId: "1:982725767484:web:dc320a230ee372d3ddae39",
  measurementId: "G-2P424GKB94",
}

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

type SensorValues = {
  Heater: boolean;
  KadarAir: number;
  Kelembapan: number;
  Suhu: number;
}


function App() {

  const dbref = useRef<DatabaseReference>();
  const blawerRef = useRef<DatabaseReference>();
  const { hours, minutes, seconds, reset, start, pause } = useStopwatch();

  const [sensorValues, setSensorValues] = useState<SensorValues>({
    Heater: false,
    KadarAir: 0,
    Kelembapan: 0,
    Suhu: 0
  });

  const [isBlawerOn, setIsBlawerOn] = useState<boolean>(false);
  const [isLoading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    dbref.current = ref(database, "Data")
    blawerRef.current = ref(database, "Blawer/BlawerButton");

    onValue(blawerRef.current, snapshot => {
      const data = snapshot.val();
      setIsBlawerOn(data);
    })

    onValue(dbref.current, (snapshot) => {
      const data = snapshot.val();
      console.log(data);
      setSensorValues(data);
    })
  }, [])

  const handleStart = async () => {
    await setBawlerStatus(true);
    start();
  }

  const handleStop = async () => {
    await setBawlerStatus(false);
    pause();
  }

  const handleRestart = async () => {
    await setBawlerStatus(false);
    reset()
    await setBawlerStatus(true);
    start()

  }

  const setBawlerStatus = async (state: boolean) => {
    if (blawerRef.current) {
      setLoading(true)
      await set(blawerRef.current, state)
      setLoading(false)
    }
  }

  return (
    <>
      <Container>
        <Center>
          <Stack>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Text>Kelembapan : {sensorValues.Kelembapan}%</Text>
            </Card>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Text>Kadar Air : {sensorValues.KadarAir}%</Text>
            </Card>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Text>Suhu : {sensorValues.Suhu} &#176;C</Text>
            </Card>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Text>Heater : {sensorValues.Heater ? "ON" : "OFF"}</Text>
            </Card>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Text ta={"center"}>{`${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`}</Text>
              <Group mt={"sm"}>
                <Button loading={isLoading} onClick={handleStart}>
                  Hidupkan
                </Button>
                <Button loading={isLoading} onClick={handleRestart}>
                  Restart
                </Button>
                <Button loading={isLoading} onClick={handleStop}>
                  Stop
                </Button>
              </Group>
            </Card>
          </Stack>
        </Center>
      </Container>
    </>
  )
}

export default App
