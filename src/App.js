import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
    Button,
    Container,
    Text,
    Title,
    Modal,
    TextInput,
    Group,
    Card,
    ActionIcon,
} from '@mantine/core';
import { MoonStars, Sun, Trash, Edit, Check } from 'tabler-icons-react';

import {
    MantineProvider,
    ColorSchemeProvider,
} from '@mantine/core';
import { useColorScheme } from '@mantine/hooks';
import { useHotkeys, useLocalStorage } from '@mantine/hooks';

export default function App() {
    const [tasks, setTasks] = useState([]);
    const [opened, setOpened] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [currentTaskId, setCurrentTaskId] = useState(null);
    const [currentTaskDetails, setCurrentTaskDetails] = useState(null); // Ajout de l'état pour les détails de la tâche

    const preferredColorScheme = useColorScheme();
    const [colorScheme, setColorScheme] = useLocalStorage({
        key: 'mantine-color-scheme',
        defaultValue: 'light',
        getInitialValueInEffect: true,
    });
    const toggleColorScheme = value =>
        setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

    useHotkeys([['mod+J', () => toggleColorScheme()]]);

    const taskTitle = useRef('');
    const taskSummary = useRef('');

    function createTask() {
        const newTask = {
            title: taskTitle.current.value,
            summary: taskSummary.current.value,
            status: ''// Ajout de la propriété completed avec la valeur false
        };

        axios.post('https://rdc83wu5s2.execute-api.us-east-1.amazonaws.com/tasks/', newTask)
            .then(response => {
                setTasks([...tasks, response.data.item]);
                setOpened(false);
            })
            .catch(error => {
                console.error(error);
            });
    }

    function deleteTask(index) {
        const taskId = tasks[index].id;
        axios.delete(`https://mjiv5dnhmb.execute-api.us-east-1.amazonaws.com/tasks/${taskId}`)
            .then(() => {
                const clonedTasks = [...tasks];
                clonedTasks.splice(index, 1);
                setTasks(clonedTasks);
            })
            .catch(error => {
                console.error(error);
            });
    }

    function loadTasks() {
        axios.get('https://0gaedahjpg.execute-api.us-east-1.amazonaws.com/tasks/')
            .then(response => {
                setTasks(response.data.items);
            })
            .catch(error => {
                console.error(error);
            });
    }

    function updateTask() {
        const updatedTask = {
            title: taskTitle.current.value,
            summary: taskSummary.current.value,
        };

        axios.put(`https://hk55zu99r0.execute-api.us-east-1.amazonaws.com/add/${currentTaskId}`, updatedTask)
            .then(response => {
                const updatedTasks = tasks.map((task, index) => {
                    if (index === editingTask) {
                        return response.data.item;
                    }
                    return task;
                });

                setTasks(updatedTasks);
                setEditingTask(null);
                setCurrentTaskId(null);
            })
            .catch(error => {
                console.error(error);
            });
    }

    function markTaskComplete(taskId, currentStatus) {
        const updatedStatus = currentStatus === 'completed' ? 'empty' : 'completed'; // Inverser l'état actuel de la tâche

        axios.put(`https://y2i6e939y8.execute-api.us-east-1.amazonaws.com/com/${taskId}`, { status: updatedStatus })
            .then(response => {
                const updatedTasks = tasks.map(task => {
                    if (task.id === taskId) {
                        return { ...task, status: updatedStatus };
                    }
                    return task;
                });
                setTasks(updatedTasks);
            })
            .catch(error => {
                console.error(error);
            });
    }

    function loadTaskDetails(taskId) {
        axios.get(`https://d3attkgu35.execute-api.us-east-1.amazonaws.com/tasks/${taskId}`)
            .then(response => {
                setCurrentTaskDetails(response.data.item); // Met à jour l'état des détails de la tâche avec les données reçues
            })
            .catch(error => {
                console.error(error);
            });
    }

    useEffect(() => {
        loadTasks();
    }, []);

    function showTaskDetails(taskId) {
        setCurrentTaskId(taskId);
        loadTaskDetails(taskId);
    }

    function handleEditTask(index) {
        setOpened(true);
        setEditingTask(index);
        setCurrentTaskId(tasks[index].id);
        taskTitle.current.value = tasks[index].title;
        taskSummary.current.value = tasks[index].summary;
    }

    return (
        <ColorSchemeProvider
            colorScheme={colorScheme}
            toggleColorScheme={toggleColorScheme}>
            <MantineProvider
                theme={{ colorScheme, defaultRadius: 'md' }}
                withGlobalStyles
                withNormalizeCSS>
                <div className='App'>
                    <Modal
                        opened={opened}
                        size={'md'}
                        title={editingTask !== null ? 'Edit Task' : 'New Task'}
                        withCloseButton={false}
                        onClose={() => {
                            setOpened(false);
                            setEditingTask(null);
                            setCurrentTaskId(null);
                        }}
                        centered>
                        <TextInput
                            mt={'md'}
                            ref={taskTitle}
                            placeholder={'Task Title'}
                            required
                            label={'Title'}
                            defaultValue={editingTask !== null ? tasks[editingTask].title : ''}
                        />
                        <TextInput
                            ref={taskSummary}
                            mt={'md'}
                            placeholder={'Task Summary'}
                            label={'Summary'}
                            defaultValue={editingTask !== null ? tasks[editingTask].summary : ''}
                        />
                        <Group mt={'md'} position={'apart'}>
                            <Button
                                onClick={() => {
                                    setOpened(false);
                                    setEditingTask(null);
                                    setCurrentTaskId(null);
                                }}
                                variant={'subtle'}>
                                Cancel
                            </Button>
                            <Button
                                onClick={() => {
                                    if (editingTask !== null) {
                                        updateTask();
                                    } else {
                                        createTask();
                                    }
                                    setOpened(false);
                                }}>
                                {editingTask !== null ? 'Save Changes' : 'Create Task'}
                            </Button>
                        </Group>
                    </Modal>
                    <Container size={550} my={40}>
                        <Group position={'apart'}>
                            <Title
                                sx={theme => ({
                                    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
                                    fontWeight: 900,
                                })}>
                                My Tasks
                            </Title>
                            <ActionIcon
                                color={'blue'}
                                onClick={() => toggleColorScheme()}
                                size='lg'>
                                {colorScheme === 'dark' ? (
                                    <Sun size={16} />
                                ) : (
                                    <MoonStars size={16} />
                                )}
                            </ActionIcon>
                        </Group>
                        {tasks.length > 0 ? (
                            tasks.map((task, index) => (
                                <Card withBorder key={task.id}>
                                    <Group position={'apart'}>
                                        <Text weight={'bold'}>{task.title}</Text>
                                        <Group>
                                            <Button
                                                variant="outline"
                                                onClick={() => handleEditTask(index)}
                                                leftIcon={<Edit />}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => markTaskComplete(task.id, task.status)}
                                                color={task.status === 'completed' ? 'green' : 'blue'}
                                                leftIcon={<Check />}
                                            >
                                                {task.status === 'completed' ? 'Undo' : 'Complete'}
                                            </Button>
                                            <Button
                                                onClick={() => showTaskDetails(task.id)}
                                                variant="outline"
                                                color="blue"
                                            >
                                                View Details
                                            </Button>
                                            <ActionIcon
                                                onClick={() => deleteTask(index)}
                                                color={'red'}
                                                variant={'transparent'}
                                            >
                                                <Trash />
                                            </ActionIcon>
                                        </Group>
                                    </Group>
                                    <Text color={'dimmed'} size={'md'} mt={'sm'}>
                                        {task.summary ? task.summary : 'No summary was provided for this task'}
                                    </Text>
                                </Card>
                            ))
                        ) : (
                            <Text size={'lg'} mt={'md'} color={'dimmed'}>
                                You have no tasks
                            </Text>
                        )}
                        <Button
                            onClick={() => {
                                setOpened(true);
                            }}
                            fullWidth
                            mt={'md'}>
                            New Task
                        </Button>
                    </Container>
                    {currentTaskDetails && (
                        <Container size={550} my={40}>
                            <Card withBorder>
                                <Group position={'apart'}>
                                    <Text weight={'bold'}>{currentTaskDetails.title}</Text>
                                    <Text color={currentTaskDetails.status === 'completed' ? 'green' : 'blue'}>
                                        {currentTaskDetails.status}
                                    </Text>
                                </Group>
                                <Text color={'dimmed'} size={'md'} mt={'sm'}>
                                    {currentTaskDetails.summary}
                                </Text>
                                <Text color={'dimmed'} size={'sm'} mt={'sm'}>
                                    Created At: {currentTaskDetails.createdAt}
                                </Text>
                                <Text color={'dimmed'} size={'sm'}>
                                    Updated At: {currentTaskDetails.updatedAt}
                                </Text>
                            </Card>
                        </Container>
                    )}
                </div>
            </MantineProvider>
        </ColorSchemeProvider>
    );
}
