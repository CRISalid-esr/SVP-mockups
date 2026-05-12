'use client'

import React, { useState, useEffect } from 'react'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Grid2 as Grid,
    Box,
    Typography,
    IconButton,
    Stepper,
    Step,
    StepLabel,
} from '@mui/material'
import { XClose as Close, ChevronLeft } from '@untitled-ui/icons-react'
import { Activity, ActivityType } from '@/types/Activity'
import { Trans } from '@lingui/react/macro'
import { t } from '@lingui/core/macro'

interface ActivityDialogProps {
    open: boolean
    onClose: () => void
    onSave: (activity: Partial<Activity>) => void
    activity?: Activity | null
}

const activityTypes: { id: ActivityType; label: string }[] = [
    { id: 'projet', label: 'Projets' },
    { id: 'encadrement', label: 'Encadrement' },
    { id: 'brevet', label: 'Brevets' },
    { id: 'conference', label: 'Conférences' },
    { id: 'enseignement', label: 'Enseignement' },
    { id: 'editorial', label: 'Éditorial' },
    { id: 'distinction', label: 'Distinctions' },
    { id: 'mediation', label: 'Médiation' },
]

const ActivityDialog: React.FC<ActivityDialogProps> = ({ open, onClose, onSave, activity }) => {
    const [step, setStep] = useState<'category' | 'form'>('category')
    const [formData, setFormData] = useState<Partial<Activity>>({})

    useEffect(() => {
        if (activity) {
            setFormData(activity)
            setStep('form')
        } else {
            setFormData({ type: 'projet' })
            setStep('category')
        }
    }, [activity, open])

    const handleTypeSelect = (type: ActivityType) => {
        setFormData({ ...formData, type })
        setStep('form')
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave(formData)
    }

    const renderSpecificFields = () => {
        switch (formData.type) {
            case 'projet':
                return (
                    <>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="Budget"
                                value={formData.specificData?.budget || ''}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    specificData: { ...formData.specificData, budget: e.target.value }
                                })}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                select
                                label="Rôle"
                                value={formData.specificData?.role || ''}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    specificData: { ...formData.specificData, role: e.target.value }
                                })}
                            >
                                <MenuItem value="Coordinateur">Coordinateur</MenuItem>
                                <MenuItem value="Participant">Participant</MenuItem>
                                <MenuItem value="Responsable de tâche">Responsable de tâche</MenuItem>
                            </TextField>
                        </Grid>
                    </>
                )
            case 'encadrement':
                return (
                    <>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="Nom de l'étudiant"
                                value={formData.specificData?.student || ''}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    specificData: { ...formData.specificData, student: e.target.value }
                                })}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                select
                                label="Niveau"
                                value={formData.specificData?.level || ''}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    specificData: { ...formData.specificData, level: e.target.value }
                                })}
                            >
                                <MenuItem value="Master">Master</MenuItem>
                                <MenuItem value="PhD">PhD</MenuItem>
                                <MenuItem value="Post-doc">Post-doc</MenuItem>
                            </TextField>
                        </Grid>
                    </>
                )
            default:
                return null
        }
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {step === 'form' && !activity && (
                        <IconButton onClick={() => setStep('category')} size="small">
                            <ChevronLeft width={20} height={20} />
                        </IconButton>
                    )}

                    <Typography variant="h6">
                        {activity ? 'Modifier l\'activité' : 'Ajouter une activité'}
                    </Typography>
                </Box>
                <IconButton onClick={onClose} size="small">
                    <Close width={20} height={20} />
                </IconButton>

            </DialogTitle>

            <DialogContent sx={{ minHeight: 300 }}>
                {step === 'category' ? (
                    <Grid container spacing={2} sx={{ py: 2 }}>
                        {activityTypes.map((t) => (
                            <Grid size={{ xs: 6, sm: 4, md: 3 }} key={t.id}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    onClick={() => handleTypeSelect(t.id)}
                                    sx={{
                                        height: 100,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 1,
                                        textTransform: 'none'
                                    }}
                                >
                                    <Typography variant="bodyLarge">{t.label}</Typography>
                                </Button>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Box component="form" onSubmit={handleSubmit} sx={{ py: 2 }}>
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    label="Titre / Nom de l'activité"
                                    required
                                    value={formData.title || ''}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    type="date"
                                    label="Date de début"
                                    required
                                    InputLabelProps={{ shrink: true }}
                                    value={formData.startDate || ''}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    type="date"
                                    label="Date de fin"
                                    InputLabelProps={{ shrink: true }}
                                    value={formData.endDate || ''}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={4}
                                    label="Description"
                                    required
                                    value={formData.description || ''}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    label="URL"
                                    type="url"
                                    value={formData.url || ''}
                                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                />
                            </Grid>
                            {renderSpecificFields()}
                        </Grid>
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} variant="outlined">Annuler</Button>
                {step === 'form' && (
                    <Button onClick={handleSubmit} variant="contained" color="primary">Enregistrer</Button>
                )}
            </DialogActions>
        </Dialog>
    )
}

export default ActivityDialog
