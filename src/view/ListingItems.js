import React, { useState } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/styles';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { ELEMENTS, DEFAULT_HAVE } from '../data/Mapping';

const useStyles = makeStyles({
    root: {
        width: 120,
        transition: 'background-color 0.2s linear'
    },
    cardIcon: {
        transition: 'width 0.1s linear 0.1s, height 0.1s linear 0.1s',
        margin: 'auto',
    },
    cardName: {
        padding: 0,
        height: '2.5em'
    },
    cardNameText: {
        width: '100%',
        height: '100%',
        margin: 0,
        padding: 0,
        fontWeight: 700,
        fontSize: '0.75em',
        whiteSpace: 'pre',
        textTransform: 'none',
        letterSpacing: -1,
        '& .MuiButton-endIcon': {
            margin: 0,
            padding: 0
        }
    },
    cardEdit: {
        paddingTop: 0,
        height: 0,
        margin: 'auto',
        transition: 'visibility 0.1s linear 0.1s, height 0.1s linear 0.1s',
    },
    Flame: { backgroundColor: 'rgb(255, 153, 153)' },
    Water: { backgroundColor: 'rgb(153, 194, 255)' },
    Wind: { backgroundColor: 'rgb(153, 255, 153)' },
    Light: { backgroundColor: 'rgb(255, 255, 153)' },
    Shadow: { backgroundColor: 'rgb(230, 153, 255)' },
    None: { backgroundColor: 'rgb(217, 217, 217)' }
});

const insertLinebreak = (name, locale) => {
    switch (locale) {
        case 'JP':
        case 'CN':
            return name.replace('\uff08', '\n\uff08');
        default:
            return name;
    }
}

export function CharaListingItem(props) {
    const { locale, id, entry, have, updateHaving, deleteHaving } = props;
    const classes = useStyles();

    const charaName = entry[`Name${locale}`];
    const [editing, setEditing] = useState(false);
    const toggleEditing = (e) => {
        setEditing(!editing);
    }

    const maxLevel = entry.Spiral ? 100 : 80;
    const lv = have ? have.lv : '';
    const validateLv = (e) => {
        const level = parseInt(e.target.value);
        let nextLevel = level;
        if (isNaN(level) || level < 1) {
            nextLevel = '';
        } else if (level > maxLevel) {
            nextLevel = maxLevel;
        }
        if (nextLevel) {
            if (have) {
                updateHaving(id, { lv: nextLevel });
            } else {
                updateHaving(id, { lv: nextLevel, mc: 1 });
            }
        } else {
            deleteHaving(id);
        }
        updateRarity();
    }

    const maxManaCircle = entry.Spiral ? 70 : 50;
    const mc = have ? have.mc : '';
    const validateMc = (e) => {
        const manaCircle = parseInt(e.target.value);
        let nextMc = manaCircle;
        if (isNaN(manaCircle) || manaCircle < 1) {
            nextMc = '';
        } else if (manaCircle > maxManaCircle) {
            nextMc = maxManaCircle;
        }
        if (nextMc) {
            if (have) {
                updateHaving(id, { mc: nextMc });
            } else {
                updateHaving(id, { lv: 1, mc: nextMc });
            }
            updateHaving(id, { mc: nextMc });
        } else {
            deleteHaving(id);
        }
        updateRarity();
    }

    const minRarity = entry.Rarity;
    const [rarity, setRarity] = useState(entry.Rarity);
    const updateRarity = () => {
        if (minRarity === 5) { return; }
        if (minRarity < 5 && (lv > 70 || mc > 40)) { setRarity(5); return; }
        if (minRarity < 4 && (lv > 60 || mc > 30)) { setRarity(4); return; }
        setRarity(minRarity);
    }

    const setMaxHave = () => {
        setRarity(5);
        const nextHave = { lv: maxLevel, mc: maxManaCircle };
        updateHaving(id, nextHave);
    }

    const setDefaultHave = () => {
        setRarity(minRarity);
        const nextHave = DEFAULT_HAVE[minRarity];
        updateHaving(id, nextHave);
    }

    const lcHaving = (e) => {
        if (!have || (have.lv === maxLevel && have.mc === maxManaCircle)) {
            setDefaultHave();
        } else {
            setMaxHave();
        }
    }
    const rcHaving = (e) => {
        if (have) { setRarity(minRarity); deleteHaving(id); }
        e.preventDefault();
    }

    return (
        <Grid item>
            <Card className={clsx(classes.root, have && classes[ELEMENTS[entry.Element]])}>
                <CardActionArea onClick={lcHaving} onContextMenu={rcHaving}>
                    <CardMedia
                        className={classes.cardIcon}
                        image={`${process.env.PUBLIC_URL}/chara/${id}_r0${rarity}.png`}
                        title={charaName} alt={id}
                        style={{
                            height: (editing ? 72 : 120),
                            width: (editing ? 72 : 120)
                        }}>
                    </CardMedia>
                </CardActionArea>
                <CardContent
                    className={classes.cardName}>
                    <Button
                        className={classes.cardNameText}
                        size="small"
                        endIcon={editing ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        onClick={toggleEditing}
                    >
                        {insertLinebreak(charaName, locale)}
                    </Button>
                </CardContent>
                <CardActions className={classes.cardEdit}
                    style={{
                        height: (editing ? 48 : 0),
                        visibility: (editing ? 'visible' : 'hidden')
                    }}>
                    <TextField label="Lv" value={lv} onInput={validateLv} />
                    <TextField label="MC" value={mc} onInput={validateMc} />
                </CardActions>
            </Card>
        </Grid>
    );
}