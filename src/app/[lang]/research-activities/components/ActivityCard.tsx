'use client'

import React from 'react'
import {
    Box,
    Typography,
    Avatar,
    IconButton,
    Chip,
    Divider,
    Grid2 as Grid,
    Tooltip,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import {
    Briefcase01 as Briefcase,
    Users01 as Users,
    BookOpen01 as BookOpen,
    Lightbulb01 as Lightbulb,
    Announcement01 as Megaphone,
    Award01 as Award,
    File02 as FileText,
    GraduationHat01 as GraduationCap,
    Calendar,
    Link01 as LinkIcon,
    Edit01 as Edit,
    Trash01 as Trash2,
} from '@untitled-ui/icons-react'

import { Activity, ActivityType } from '@/types/Activity'
import { CustomCard } from '@/components/Card'

type UntitledIcon = React.ComponentType<{ size?: number; style?: React.CSSProperties; className?: string }>

interface ActivityCardProps {
    activity: Activity
    onEdit?: (activity: Activity) => void
    onDelete?: (activity: Activity) => void
}

const getActivityIcon = (type: ActivityType): UntitledIcon => {
    switch (type) {
        case 'projet': return Briefcase
        case 'encadrement': return Users
        case 'editorial': return BookOpen
        case 'brevet': return Lightbulb
        case 'conference': return Megaphone
        case 'distinction': return Award
        case 'mediation': return FileText
        case 'enseignement': return GraduationCap
        default: return FileText
    }
}

const getActivityColor = (type: ActivityType, theme: any) => {
    const colors: Record<ActivityType, string> = {
        projet: theme.palette.primary.main,
        encadrement: '#0088cc',
        editorial: '#9b59b6',
        brevet: '#f39c12',
        conference: '#e74c3c',
        distinction: '#d4af37',
        mediation: '#16a085',
        enseignement: '#2ecc71',
    }
    return colors[type] || theme.palette.text.secondary
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onEdit, onDelete }) => {
    const theme = useTheme()
    const Icon = getActivityIcon(activity.type)
    const color = getActivityColor(activity.type, theme)

    const header = (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                    sx={{
                        backgroundColor: `${color}15`,
                        width: 40,
                        height: 40,
                        borderRadius: 1,
                    }}
                >
                    <Icon size={20} style={{ color }} />
                </Avatar>
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {activity.title}
                    </Typography>

                    <Chip
                        label={activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                        size="small"
                        sx={{
                            height: 20,
                            fontSize: '0.7rem',
                            backgroundColor: `${color}15`,
                            color: color,
                            fontWeight: 600,
                            mt: 0.5
                        }}
                    />
                </Box>
            </Box>
            <Box>
                {onEdit && (
                    <IconButton size="small" onClick={() => onEdit(activity)}>
                        <Edit size={18} />
                    </IconButton>
                )}
                {onDelete && (
                    <IconButton size="small" onClick={() => onDelete(activity)}>
                        <Trash2 size={18} />
                    </IconButton>
                )}
            </Box>
        </Box>
    )

    return (
        <CustomCard header={header}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="body1" color="text.secondary">
                    {activity.description}
                </Typography>


                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Calendar size={16} color={theme.palette.text.secondary} />
                        <Typography variant="body2" color="text.secondary">
                            {new Date(activity.startDate).toLocaleDateString()}
                            {activity.endDate && ` - ${new Date(activity.endDate).toLocaleDateString()}`}
                        </Typography>

                    </Box>

                    {activity.url && (
                        <Box
                            component="a"
                            href={activity.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                color: theme.palette.primary.main,
                                textDecoration: 'none',
                                '&:hover': { textDecoration: 'underline' }
                            }}
                        >
                            <LinkIcon size={16} />
                            <Typography variant="body2" color="inherit">
                                Lien externe
                            </Typography>

                        </Box>
                    )}
                </Box>

                {activity.specificData && Object.keys(activity.specificData).length > 0 && (
                    <>
                        <Divider />
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                            {Object.entries(activity.specificData).map(([key, value]) => (
                                <Box key={key} sx={{ display: 'flex', gap: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'capitalize' }}>
                                        {key}:
                                    </Typography>
                                    <Typography variant="body2">
                                        {String(value)}
                                    </Typography>

                                </Box>
                            ))}
                        </Box>
                    </>
                )}
            </Box>
        </CustomCard>
    )
}

export default ActivityCard
