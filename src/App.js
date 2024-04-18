import './App.css'; // Import custom CSS for animations
import { FaDumbbell, FaTrashAlt, FaArrowAltCircleRight } from 'react-icons/fa';
import { MdList, MdEdit, MdDateRange, MdAccessTime } from 'react-icons/md';
import "@aws-amplify/ui-react/styles.css";
import {
  withAuthenticator,
} from "@aws-amplify/ui-react";
import { useEffect, useState } from "react";
import { Button, Container, Form, Row, Col, Card, Navbar, Nav } from "react-bootstrap";
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';
import config from './amplifyconfiguration.json';
import { createWorkout, deleteWorkout, updateWorkout } from "./graphql/mutations";
import { listWorkouts } from "./graphql/queries";
import { FaRotateRight } from 'react-icons/fa6';
import { getCurrentUser } from 'aws-amplify/auth';
Amplify.configure(config);


const client = generateClient();


function App({ signOut }) {
  const [reps, setReps] = useState('')
  const [sets, setSets] = useState('')
  const [weight, setWeight] = useState('')
  const [workoutName, setworkoutName] = useState('')
  const [workouts, setWorkouts] = useState([])
  const [user, setUserName] = useState("")


  useEffect(() => {
    fetchWorkouts();
    currentAuthenticatedUser()
  }, [])

  function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString(); // Convert timestamp to a readable date format
  }

  function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString(); // Convert timestamp to a readable time format
  }

  async function currentAuthenticatedUser() {

    try {

      const { username } = await getCurrentUser();
      setUserName(username)
    } catch (err) {

      console.log(err);

    }

  }
  async function fetchWorkouts() {
    try {
      const apiData = await client.graphql({ query: listWorkouts });
      const workoutsFromApi = apiData.data.listWorkouts.items; // Assuming workouts are nested inside items array
      setWorkouts(workoutsFromApi);
    } catch (error) {
      console.error('Error fetching workouts:', error);
    }
  }

  async function HandleSubmit(event) {
    event.preventDefault()


    await client.graphql({
      query: createWorkout,
      variables: {
        input: {
          name: workoutName,
          reps: reps,
          sets, sets,
          weight, weight,
        }
      }
    })
    fetchWorkouts()
    setworkoutName("")
    setReps("")
    setSets("")
    setWeight("")

  }



  async function handleDelete({ id }) {
    console.log(id)
    const newWorkouts = workouts.filter((note) => note.id !== id);
    setWorkouts(newWorkouts);
    try {
      await client.graphql({
        query: deleteWorkout,
        variables: { input: { id } },
      });
    } catch (error) {
      console.error("Error deleting workout:", error);
      alert("Error deleting workout:")
    }
  }


  return (
    <>

      <Navbar bg="light" expand="lg">
        <Container>
          <Navbar.Brand href="#home">Gym Workout Tracker</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              {/* Add other navigation links here if needed */}
            </Nav>
            <Nav>
              <Nav.Item className="me-3">Welcome {user} </Nav.Item>
              <Button variant="outline-danger" onClick={signOut}>Sign Out</Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="mt-5">
        <Row className="justify-content-center">
          <Col md={6}>

            <Form>
              <Row className="mb-3">
                <Col xs={12} md={6}>
                  <Form.Group controlId="workoutName">
                    <Form.Label>Workout Name</Form.Label>
                    <Form.Control type="text" placeholder="Enter workout name"
                      onChange={(event) => setworkoutName(event.target.value)}
                      value={workoutName}
                    />
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group controlId="reps">
                    <Form.Label>Reps</Form.Label>
                    <Form.Control type="number" placeholder="Enter number of repetitions"
                      onChange={(event) => setReps(event.target.value)}
                      value={reps}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col xs={12} md={6}>
                  <Form.Group controlId="weight">
                    <Form.Label>Weight (kg)</Form.Label>
                    <Form.Control type="number" placeholder="Enter weight"
                      onChange={(event) => setWeight(event.target.value)}
                      value={weight}
                    />
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group controlId="sets">
                    <Form.Label>Sets</Form.Label>
                    <Form.Control type="number" placeholder="Enter number of sets"
                      onChange={(event) => setSets(event.target.value)}
                      value={sets}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Button variant="primary" onClick={HandleSubmit}>
                Add Workout
              </Button>
            </Form>
          </Col>
        </Row>
        <Row className="mt-4 justify-content-center">
          <Col md={8}>
            <h1 className="text-center my-4">Workouts</h1>
            {workouts.length === 0 ? (
              <p className="text-center">No workouts found.</p>
            ) : (
              <div className="card-container">
                {workouts.map(workout => (
                  <div key={workout.id} className="animated-card mb-4">
                    <Card className="shadow-lg">
                      <Card.Body>
                        <Card.Title> {workout.name}</Card.Title>
                        <Card.Text>
                          <FaDumbbell /> Weight: {workout.weight} kg<br />
                          <MdList /> Sets: {workout.sets}<br />
                          <FaRotateRight className="rotation-icon" /> Reps: {workout.reps} <br />
                          <MdDateRange /> Created At: {formatDate(workout.createdAt)}<br />
                          <MdAccessTime /> Created At: {formatTime(workout.createdAt)}
                        </Card.Text>
                        <Button variant="primary" className="me-2">
                          <MdEdit />
                        </Button>
                        <Button variant="danger" onClick={() => handleDelete(workout)}>
                          <FaTrashAlt />
                        </Button>
                      </Card.Body>
                    </Card>
                  </div>
                ))}
              </div>
            )}
          </Col>
        </Row>
      </Container>
    </>

  );
}

export default withAuthenticator(App);