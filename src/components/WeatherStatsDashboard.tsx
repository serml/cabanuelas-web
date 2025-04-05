import React, { useState, useEffect } from 'react';
import {
    Box, Card, CardContent, Typography, Grid,
    Autocomplete, TextField, Paper, InputAdornment
} from '@mui/material';
import { ThemeProvider, alpha, createTheme, darken } from '@mui/material/styles';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import CloudIcon from '@mui/icons-material/Cloud';
import UmbrellaIcon from '@mui/icons-material/BeachAccess';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import Papa from 'papaparse';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SearchIcon from '@mui/icons-material/Search';
import { ExpandMore, Search } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import sunnyImage from '../assets/sunny.png';
import cloudyImage from '../assets/clody.png';
import rainyImage from '../assets/rainy.png';
import snowyImage from '../assets/snowy.png';
import citiesCSV from '../assets/cities.csv';

// Theme
const theme = createTheme({
    palette: {
        primary: {
            main: '#89CFF0', // Azul pastel suave
        },
        secondary: {
            main: '#B5EAD7', // Verde menta claro
        },
        background: {
            default: '#F8F9FA', // Gris muy claro
            paper: '#FFFFFF',
        },
        text: {
            primary: '#5D5F71', // Gris azulado
            secondary: '#8E8E99', // Gris medio
        },
    },
    typography: {
        fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
        h4: {
            fontWeight: 600,
            letterSpacing: '-0.5px',
            color: '#5D5F71',
        },
        h2: {
            fontWeight: 700,
            fontSize: '3rem',
            letterSpacing: '-0.75px',
        },
        subtitle1: {
            fontWeight: 500,
            letterSpacing: '0.1px',
        },
    },
});

// Sample weather data
// Sample weather data
const weatherData = {
    sunny: { day: 15, percentage: 65, years: 52, maxTemp: 25, minTemp: 15 },
    cloudy: { day: 7, percentage: 70, years: 56, maxTemp: 20, minTemp: 10 },
    rainy: { day: 22, percentage: 60, years: 48, maxTemp: 18, minTemp: 8 },
    snowy: { day: 3, percentage: 30, years: 24, maxTemp: 5, minTemp: -5 },
};

const totalYears = 84;

const getDayWithSuffix = (day) => {
    if (day >= 11 && day <= 13) {
        return day + 'th';
    }
    switch (day % 10) {
        case 1: return day + 'st';
        case 2: return day + 'nd';
        case 3: return day + 'rd';
        default: return day + 'th';
    }
}

const HorizontalCard = styled(Card)(({ theme, selectedMonth, selectedDay }) => ({
    display: 'flex',
    height: 220, // Increased height for better spacing
    borderRadius: 12,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.3s',
    '&:hover': { transform: 'translateY(-4px)' },
    backgroundImage: 'url(https://pplx-res.cloudinary.com/image/upload/v1743867743/user_uploads/sMqHGzCeksPNMoc/5a3578d4-aa29-4646-9723-ac8f62805f36.jpg)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
    overflow: 'hidden',
    '&:before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.5)', // More subtle white overlay
        zIndex: 1,
    },
    color: theme.palette.getContrastText('#B5EAD7'),
}));

const HorizontalCardContent = styled(CardContent)(({ theme }) => ({
    flex: '1 0 auto',
    padding: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 2,
    backgroundColor: 'transparent',
}));

const StyledText = styled(Typography)(({ theme }) => ({
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontWeight: 500,
    fontSize: '1.1rem',
    color: theme.palette.text.primary,
    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)',
}));

const StyledCard = styled(Card)(({ theme, image }) => ({
    height: 340,
    borderRadius: 12,
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.3s',
    '&:hover': { transform: 'translateY(-8px)' },
    backgroundImage: `url(${image})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
    overflow: 'hidden',
    '&:before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.1)', // Dark overlay
        zIndex: 1,
    },
}));


const LabelBox = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    width: '93%',
    padding: theme.spacing(1),
    backgroundColor: alpha(theme.palette.primary.main, 0.7),
    color: theme.palette.text.secondary,
    textAlign: 'center',
    fontWeight: theme.typography.fontWeightBold,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    zIndex: 1,
}));

const StyledCardContent = styled(CardContent)(({ theme }) => ({
    height: '100%',
    width: 200,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(2), // Reduce padding for more space
    position: 'relative',
    zIndex: 2,
}));

const StyledDay = styled(Typography)(({ theme }) => ({
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: 800,
    fontSize: '3.5rem',
    color: 'white',
    marginBottom: theme.spacing(0.5),
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
}));

const StyledDayLabel = styled(Typography)(({ theme }) => ({
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 600,
    fontSize: '1.2rem',
    color: 'white',
    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.4)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
}));

const StyledInfo = styled(Typography)(({ theme }) => ({
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
    fontSize: '0.9rem',
    color: 'white',
    textAlign: 'center',
    marginTop: theme.spacing(1),
    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.4)',
}));
// Sample CSV data
const csvData = `country,name,lat,lng
AD,Vila,42.53176,1.56654
AD,El Tarter,42.57952,1.65362
AD,Sant Julià de Lòria,42.46372,1.49129`;

// Abreviaturas de los meses con colores
const months = [
    // Invierno (frío - azules suaves)
    { name: 'JAN', color: '#B5E5F8', days: 31, number: 1 }, // Azul hielo
    { name: 'FEB', color: '#9FD8F7', days: 28, number: 2 }, // Azul nevado
    { name: 'MAR', color: '#D4F0C4', days: 31, number: 3 }, // Verde brote
    { name: 'APR', color: '#FFD1DC', days: 30, number: 4 }, // Rosa floración
    { name: 'MAY', color: '#FFECB8', days: 31, number: 5 }, // Amarillo primavera
    { name: 'JUN', color: '#FFB347', days: 30, number: 6 }, // Naranja sol
    { name: 'JUL', color: '#FF6961', days: 31, number: 7 }, // Rojo verano
    { name: 'AUG', color: '#FF9AA2', days: 31, number: 8 }, // Rosa cálido
    { name: 'SEP', color: '#E8C39E', days: 30, number: 9 }, // Beige otoñal
    { name: 'OCT', color: '#D4A59A', days: 31, number: 10 }, // Terracota
    { name: 'NOV', color: '#BCAAA4', days: 30, number: 11 }, // Marrón hoja seca
    { name: 'DEC', color: '#C7E9FF', days: 31, number: 12 }  // Azul claro invernal
].sort((a, b) => {
    // Ordenamos según el orden cronológico
    const monthOrder = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return monthOrder.indexOf(a.name) - monthOrder.indexOf(b.name);
});


const WeatherStatsDashboard = () => {
    const [cities, setCities] = useState([]);
    const [selectedCity, setSelectedCity] = useState(null);
    const [inputValue, setInputValue] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [selectedDay, setSelectedDay] = useState(null);
    const [days, setDays] = useState([]);
    const [apiData, setApiData] = useState(null);
    const [monthlyData, setMonthlyData] = useState(null);
    const [mostCommonWeather, setMostCommonWeather] = useState(null);

    useEffect(() => {
        Papa.parse(citiesCSV, {
            download: true,
            header: true,
            complete: (results) => {
                setCities(results.data.map(city => ({
                    ...city,
                    lat: parseFloat(city.lat),
                    lng: parseFloat(city.lng)
                })));
            },
        });
    }, []);

    const getWeatherDataForDay = (apiData, selectedMonth, selectedDay) => {
        if (!apiData || !selectedMonth || !selectedDay) {
            return null;
        }

        const monthNumber = months.find(month => month.name === selectedMonth)?.number;
        if (!monthNumber) {
            return null;
        }

        const selectedDateData = apiData.find(item => item.month === monthNumber && item.day === selectedDay);
        if (!selectedDateData) {
            return null;
        }

        const weatherCounts = selectedDateData.weather_counts || {};
        console.log(weatherCounts);
        const mostCommonWeather = Object.keys(weatherCounts).length > 0 ? Object.entries(weatherCounts).sort(([, a], [, b]) => b - a)[0] : null;

        const totalOccurrences = 2024 - 1940; //Object.values(weatherCounts).reduce((sum, value) => sum + value, 0);

        console.log({
            weather: mostCommonWeather ? mostCommonWeather[0] : 'Unknown',
            occurrences: mostCommonWeather ? mostCommonWeather[1] : 0,
            percentage: (mostCommonWeather && totalOccurrences > 0) ? ((mostCommonWeather[1] / totalOccurrences) * 100).toFixed(2) : 0,
        });
        return {
            weather: mostCommonWeather ? mostCommonWeather[0] : 'Unknown',
            occurrences: mostCommonWeather ? mostCommonWeather[1] : 0,
            percentage: (mostCommonWeather && totalOccurrences > 0) ? ((mostCommonWeather[1] / totalOccurrences) * 100).toFixed(2) : 0,
        };
    };
    const handleMonthSelect = (monthName) => {
        setSelectedMonth(monthName);
        setSelectedDay(null);
        setMostCommonWeather(null)
        const month = months.find(m => m.name === monthName);
        setDays([...Array(month.days)].map((_, i) => i + 1));
        if (apiData) {
            const monthNumber = months.find(m => m.name === monthName).number;
            const monthlyStats = calculateMonthlyStats(apiData, monthNumber);
            setMonthlyData(monthlyStats);
        }
    };

    const handleDaySelect = (day) => {
        setSelectedDay(day);
        if (apiData && selectedMonth) {
            const monthNumber = months.find(m => m.name === selectedMonth)?.number;
            const selectedDateData = apiData.find(item => item.month === monthNumber && item.day === day);
            if (selectedDateData) {
                // Find the most common weather on the selected day
                const weatherCounts = selectedDateData.weather_counts;
                if (weatherCounts) {
                    const mostCommon = Object.entries(weatherCounts).sort(([, a], [, b]) => b - a)[0];
                    if (mostCommon) {
                        setMostCommonWeather({ weather: mostCommon[0], percentage: (mostCommon[1] / days.length) * 100 });
                    } else {
                        setMostCommonWeather(null);
                    }
                } else {
                    setMostCommonWeather(null);
                }
            } else {
                setMostCommonWeather(null);
            }
        } else {
            setMostCommonWeather(null);
        }
    };

    const handleCitySelect = async (event, newValue) => {
        setSelectedCity(newValue);
        setSelectedMonth(null)
        setSelectedDay(null)
        setMonthlyData(null)
        setMostCommonWeather(null)
        if (newValue) {
            try {
                const response = await fetch(`http://127.0.0.1:8000/weather/?latitude=${newValue.lat}&longitude=${newValue.lng}`);
                if (response.ok) {
                    const data = await response.json();
                    setApiData(data);
                } else {
                    console.error("Failed to fetch weather data:", response.status);
                    setApiData(null)
                    setMostCommonWeather(null)
                }
            } catch (error) {
                console.error("Error fetching weather data:", error);
                setApiData(null)
                setMostCommonWeather(null)
            }
        } else {
            setApiData(null);
            setMostCommonWeather(null)
        }
    };

    const calculateMonthlyStats = (data, monthNumber) => {
        if (!data) return null;

        const monthData = data.filter(item => item.month === monthNumber);
        const weatherCounts = {
            sunny: {},
            cloudy: {},
            rainy: {},
            snowy: {}
        };

        monthData.forEach(item => {
            const day = item.day;
            for (const [weather, count] of Object.entries(item.weather_counts)) {
                if (!weatherCounts[weather]) {
                    weatherCounts[weather] = {}
                }
                if (!weatherCounts[weather][day]) {
                    weatherCounts[weather][day] = 0;
                }
                weatherCounts[weather][day] += count;
            }
        });
        const totalOccurrences = 2024 - 1940;
        const findMostCommonDay = (weatherData) => {
            if (Object.keys(weatherData).length === 0) {
                return { day: null, occurrences: 0, percentage: 0 };
            }
            const sortedDays = Object.entries(weatherData).sort(([, a], [, b]) => b - a);
            const mostCommonDay = sortedDays[0];

            const percentage = (mostCommonDay[1] / totalOccurrences) * 100;
            return {
                day: parseInt(mostCommonDay[0]),
                occurrences: mostCommonDay[1],
                totalOccurrences: parseInt(totalOccurrences),
                percentage: percentage.toFixed(2)
            };
        };


        return {
            mostSunny: findMostCommonDay(weatherCounts['sunny']),
            mostCloudy: findMostCommonDay(weatherCounts['cloudy']),
            mostRainy: findMostCommonDay(weatherCounts['rainy']),
            mostSnowy: findMostCommonDay(weatherCounts['snowy'])
        };
    };

    useEffect(() => {
        if (apiData && selectedDay && selectedMonth) {
            const weatherForDay = getWeatherDataForDay(apiData, selectedMonth, selectedDay);
            setMostCommonWeather(weatherForDay);
        }
    }, [apiData, selectedDay, selectedMonth]);
    return (
        <ThemeProvider theme={theme}>
            <Box sx={{
                bgcolor: 'background.default',
                minHeight: '100vh',
                p: { xs: 3, md: 4 },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}>
                {/* Header */}
                <Box sx={{
                    textAlign: 'center',
                    mb: 5,
                    maxWidth: 800
                }}>
                    <Typography
                        variant="h4"
                        component="h1"
                        sx={{
                            mb: 1.5,
                            fontWeight: 600,
                        }}
                    >
                        Weather Insights
                    </Typography>
                    <Typography variant="subtitle1" sx={{
                        color: 'text.secondary',
                    }}>
                        Explore climate patterns and statistics
                    </Typography>
                </Box> {/* City Search */}
                <Box sx={{
                    mb: 5,
                    width: '100%',
                    maxWidth: 600,
                    mx: 'auto'
                }}>
                    <Autocomplete
                        options={cities}
                        getOptionLabel={(option) => `${option.name}, ${option.country}`}
                        value={selectedCity}
                        onChange={handleCitySelect}
                        inputValue={inputValue}
                        onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
                        noOptionsText="No cities found"
                        popupIcon={<ExpandMore sx={{ color: 'text.secondary' }} />}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                variant="outlined"
                                placeholder="Search for a city..."
                                InputProps={{
                                    ...params.InputProps,
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search sx={{ color: 'text.secondary' }} />
                                        </InputAdornment>
                                    ),
                                    sx: {
                                        borderRadius: 2,
                                        bgcolor: 'background.paper',
                                        '& fieldset': {
                                            borderColor: '#E1E3E6',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: '#89CFF0',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#89CFF0',
                                            borderWidth: 1
                                        }
                                    }
                                }}
                            />
                        )}
                        PaperComponent={({ children }) => (
                            <Paper sx={{
                                mt: 1,
                                borderRadius: 2,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                border: '1px solid',
                                borderColor: '#E1E3E6',
                            }}>
                                {children}
                            </Paper>
                        )}
                        sx={{
                            '& .MuiAutocomplete-option': {
                                px: 3,
                                py: 2,
                                '&[aria-selected="true"]': {
                                    bgcolor: 'rgba(137, 207, 240, 0.08)'
                                },
                                '&.Mui-focused': {
                                    bgcolor: 'rgba(137, 207, 240, 0.04)'
                                }
                            }
                        }}
                    />
                </Box>
                {/* Month Selection */}
                <Typography variant="subtitle1" sx={{
                    mb: 3,
                    color: 'text.primary',
                    fontWeight: 500,
                    letterSpacing: '0.5px'
                }}>
                    Select a month
                </Typography>

                <Grid container spacing={2} sx={{ justifyContent: 'center', px: 2, pb: 4 }}>
                    {months.map((month, index) => (
                        <Grid item key={index} xs={4} sm={3} md={2} lg={1.5}>
                            <Card
                                onClick={() => handleMonthSelect(month.name)}
                                sx={{
                                    height: 100,
                                    width: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    borderRadius: 3,
                                    boxShadow: 'none',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    transition: 'all 0.3s ease-out',
                                    background: selectedMonth === month.name
                                        ? `linear-gradient(135deg, ${month.color} 0%, ${darken(month.color, 0.15)} 100%)`
                                        : 'transparent',
                                    border: `1px solid ${alpha(month.color, selectedMonth === month.name ? 0.4 : 0.2)}`,
                                    '&:hover': {
                                        transform: 'scale(1.05)',
                                        boxShadow: `0 8px 24px ${alpha(month.color, 0.2)}`,
                                        borderColor: alpha(month.color, 0.5),
                                    },
                                    '&::before': selectedMonth === month.name ? {
                                        content: '""',
                                        position: 'absolute',
                                        top: -10,
                                        right: -10,
                                        width: 40,
                                        height: 40,
                                        background: alpha('#fff', 0.2),
                                        borderRadius: '50%',
                                    } : {},
                                }}
                            >
                                <CardContent sx={{
                                    p: 1.5,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '100%',
                                    height: '100%',
                                    zIndex: 1
                                }}>
                                    <Box sx={{
                                        width: 48,
                                        height: 48,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mb: 2,
                                        mt: 1.5,
                                        borderRadius: '50%',
                                        background: selectedMonth === month.name
                                            ? alpha('#fff', 0.2)
                                            : alpha(month.color, 0.15),
                                        transition: 'all 0.3s ease'
                                    }}>
                                        <CalendarMonthIcon sx={{
                                            fontSize: 20,
                                            color: selectedMonth === month.name ? '#fff' : darken(month.color, 0.3)
                                        }} />
                                    </Box>
                                    <Typography
                                        variant="subtitle1"
                                        sx={{
                                            fontWeight: 600,
                                            letterSpacing: 0.5,
                                            fontFamily: "'Inter', sans-serif",
                                            color: selectedMonth === month.name ? '#fff' : darken(month.color, 0.5),
                                            textTransform: 'uppercase',
                                            fontSize: '0.8rem'
                                        }}
                                    >
                                        {month.name}
                                    </Typography> {selectedMonth === month.name && (
                                        <Box sx={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            height: 4,
                                            background: alpha('#fff', 0.8)
                                        }} />
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
                <Box sx={{ width: '60%', mt: 4 }}>
                    <Grid container spacing={4} sx={{ width: '100%', justifyContent: 'center' }}>
                        {/* Sunny Card */}
                        <Grid item xs={12} sm={6} md={3}>
                            <StyledCard image={sunnyImage}>
                                <LabelBox>
                                    <StyledDayLabel variant="h6">
                                        Sunniest Day
                                    </StyledDayLabel>
                                </LabelBox>
                                <StyledCardContent>
                                    <StyledDay variant="h2" component="div">
                                        {monthlyData?.mostSunny.day ? getDayWithSuffix(monthlyData.mostSunny.day) : "N/A"}
                                    </StyledDay>
                                    <StyledInfo>
                                        {monthlyData?.mostSunny.day ? `Seen in ${monthlyData.mostSunny.occurrences}/${monthlyData.mostSunny.totalOccurrences} years (${monthlyData.mostSunny.percentage}%)` : "N/A"}
                                    </StyledInfo>
                                </StyledCardContent>
                            </StyledCard>
                        </Grid>

                        {/* Cloudy Card */}
                        <Grid item xs={12} sm={6} md={3}>
                            <StyledCard image={cloudyImage}>
                                <LabelBox>
                                    <StyledDayLabel variant="h6">
                                        Cloudiest Day
                                    </StyledDayLabel>
                                </LabelBox>
                                <StyledCardContent>
                                    <StyledDay variant="h2" component="div">
                                        {monthlyData?.mostCloudy.day ? getDayWithSuffix(monthlyData.mostCloudy.day) : "N/A"}
                                    </StyledDay>
                                    <StyledInfo>
                                        {monthlyData?.mostCloudy.day ? `Seen in ${monthlyData.mostCloudy.occurrences}/${monthlyData.mostCloudy.totalOccurrences} years (${monthlyData.mostCloudy.percentage}%)` : "N/A"}
                                    </StyledInfo>
                                </StyledCardContent>
                            </StyledCard>
                        </Grid>
                        {/* Rainy Card */}
                        <Grid item xs={12} sm={6} md={3}>
                            <StyledCard image={rainyImage}>
                                <LabelBox>
                                    <StyledDayLabel variant="h6">
                                        Rainiest Day
                                    </StyledDayLabel>
                                </LabelBox>
                                <StyledCardContent>
                                    <StyledDay variant="h2" component="div">
                                        {monthlyData?.mostRainy.day ? getDayWithSuffix(monthlyData.mostRainy.day) : "N/A"}
                                    </StyledDay>
                                    <StyledInfo>
                                        {monthlyData?.mostRainy.day ? `Seen in ${monthlyData.mostRainy.occurrences}/${monthlyData.mostRainy.totalOccurrences} years (${monthlyData.mostRainy.percentage}%)` : "N/A"}
                                    </StyledInfo>
                                </StyledCardContent>
                            </StyledCard>
                        </Grid>

                        {/* Snowy Card */}
                        <Grid item xs={12} sm={6} md={3}>
                            <StyledCard image={snowyImage}>
                                <LabelBox>
                                    <StyledDayLabel variant="h6">
                                        Snowiest Day
                                    </StyledDayLabel>
                                </LabelBox>
                                <StyledCardContent>
                                    <StyledDay variant="h2" component="div">
                                        {monthlyData?.mostSnowy.day ? getDayWithSuffix(monthlyData.mostSnowy.day) : "N/A"}
                                    </StyledDay>
                                    <StyledInfo>
                                        {monthlyData?.mostSnowy.day ? `Seen in ${monthlyData.mostSnowy.occurrences}/${monthlyData.mostSnowy.totalOccurrences} years (${monthlyData.mostSnowy.percentage}%)` : "N/A"}
                                    </StyledInfo>
                                </StyledCardContent>
                            </StyledCard>
                        </Grid>
                    </Grid>
                </Box>

                {/* Day Selection */}
                {selectedMonth && (
                    <Box>
                        <Typography variant="subtitle1" sx={{
                            mb: 3,
                            mt: 3,
                            color: 'text.primary',
                            fontWeight: 500,
                            letterSpacing: '0.5px'
                        }}>
                            Select a day
                        </Typography>
                        <Grid container spacing={2} sx={{ maxWidth: 1000, display: 'flex', flexWrap: 'wrap' }} justifyContent="flex-start">
                            {days.map((day, index) => (
                                <Grid item key={day} xs={6} sm={4} md={3} lg={2} sx={{ flexBasis: 'calc(100% / 22)' }}>
                                    <Card
                                        onClick={() => handleDaySelect(day)}
                                        sx={{
                                            width: '100%',
                                            height: 40,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            borderRadius: 2,
                                            backgroundColor: selectedDay === day ? theme.palette.primary.main : theme.palette.background.paper,
                                            color: selectedDay === day ? 'white' : theme.palette.text.primary,
                                            border: `1px solid ${theme.palette.primary.light}`,
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                backgroundColor: theme.palette.primary.light,
                                                color: theme.palette.text.secondary,
                                            },
                                        }}
                                    >
                                        <Typography variant="body1">{day}</Typography>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                )}

                {selectedDay && mostCommonWeather && (
                    <Box sx={{ width: '55%', mt: 4 }}>
                        <HorizontalCard selectedMonth={selectedMonth} selectedDay={selectedDay}>
                            <HorizontalCardContent>
                                <StyledText variant="h6">
                                    {selectedMonth} {getDayWithSuffix(selectedDay)}
                                </StyledText>
                                <StyledText variant="h5" component="div">
                                    Most Common: {mostCommonWeather.weather}
                                </StyledText>
                                <StyledText variant="body2" color="text.secondary">
                                    {parseFloat(mostCommonWeather.percentage).toFixed(2)}%
                                </StyledText>
                            </HorizontalCardContent>
                            <HorizontalCardContent>
                                <StyledText variant="subtitle1">
                                    Avg. Max Temp: N/A
                                </StyledText>
                                <StyledText variant="subtitle1">
                                    Avg. Min Temp: N/A
                                </StyledText>
                            </HorizontalCardContent>
                        </HorizontalCard>
                    </Box>
                )}
            </Box>
        </ThemeProvider>
    );
};

export default WeatherStatsDashboard;
