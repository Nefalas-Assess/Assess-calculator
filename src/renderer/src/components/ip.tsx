import React, { useContext, useState } from 'react'
import { intervalToDuration } from 'date-fns'
import { AppContext } from '@renderer/providers/AppProvider'

const ITP = () => {
  const { data } = useContext(AppContext)

  // Fonction pour créer une nouvelle ligne avec des valeurs par défaut
  const createRow = () => ({
    debut: '', // Date de début par défaut
    fin: '', // Date de fin par défaut
    jours: '', // Nombre de jours calculé automatiquement
    indemniteitp: 32, // Indemnité journalière par défaut
    indemniteitm: 30,
    pourcentage: '', // Pourcentage d'application
    total: '' // Total calculé automatiquement
  })

  // Fonction appelée lorsqu'une touche est pressée dans un champ d'entrée
  // Si la touche "Tab" est pressée sur la dernière ligne, une nouvelle ligne est ajoutée
  const handleKeyDown = (index, e) => {
    if (e.key === 'Tab' && index === rows.length - 1) {
      e.preventDefault() // Empêche le comportement par défaut de "Tab"
      addRow() // Ajoute une nouvelle ligne
    }
  }

  // État contenant la liste des lignes dans le tableau
  // Initialement, il y a une seule ligne créée avec la fonction `createRow`
  const [rows, setRows] = useState([createRow()])

  // Fonction pour calculer le nombre de jours et le total pour une ligne donnée
  const calculateRow = (row) => {
    const { debut, fin, indemnite, pourcentage } = row
    let jours = ''
    let total = ''

    if (debut && fin) {
      const debutDate = new Date(debut)
      const finDate = new Date(fin)
      if (!isNaN(debutDate) && !isNaN(finDate)) {
        // Calcul du nombre de jours entre les deux dates
        jours = Math.max(0, (finDate - debutDate) / (1000 * 60 * 60 * 24))
        // Calcul du total basé sur les jours, indemnité et pourcentage
        total = (jours * indemnite * (pourcentage / 100)).toFixed(2)
      }
    }
    return { jours, total }
  }

  // Fonction pour ajouter une nouvelle ligne dans le tableau
  const addRow = () => {
    const newRow = createRow()

    // Si une ligne existe déjà, on utilise la date de fin de la dernière ligne pour calculer la nouvelle date de début
    if (rows.length > 0) {
      const lastRowFin = rows[rows.length - 1].fin
      if (lastRowFin) {
        const finDate = new Date(lastRowFin)
        if (!isNaN(finDate)) {
          finDate.setDate(finDate.getDate() + 1) // Ajoute 1 jour à la date de fin précédente
          newRow.debut = finDate.toISOString().split('T')[0] // Formate la nouvelle date
        }
      }
    }

    // Ajoute la nouvelle ligne à l'état `rows`
    setRows([...rows, newRow])
  }

  // Fonction pour gérer les changements dans les champs d'entrée
  // Met à jour les valeurs dans l'état `rows` et recalcul le total
  const handleInputChange = (index, field, value) => {
    const updatedRows = [...rows]
    updatedRows[index][field] = value // Met à jour la valeur du champ modifié
    const { jours, total } = calculateRow(updatedRows[index]) // Recalcule les champs dérivés
    updatedRows[index].jours = jours
    updatedRows[index].total = total
    setRows(updatedRows)
  }

  // Fonction pour calculer la somme totale de tous les totaux dans le tableau
  const getTotalSum = () => {
    return rows.reduce((sum, row) => sum + (parseFloat(row.total) || 0), 0).toFixed(2)
  }

  // Fonction pour réinitialiser les données (après confirmation de l'utilisateur)
  const resetData = () => {
    if (window.confirm('Êtes-vous sûr de vouloir réinitialiser les données ?')) {
      setRows([createRow()]) // Réinitialise avec une seule ligne vide
    }
  }

  // Fonction pour imprimer uniquement la section "main"
  const printMain = () => {
    const mainContent = document.getElementById('main').innerHTML
    const originalContent = document.body.innerHTML

    // Remplace temporairement le contenu de la page par le contenu de <div id="main">
    document.body.innerHTML = mainContent

    // Lance l'impression
    window.print()

    // Restaure le contenu original de la page
    document.body.innerHTML = originalContent
    window.location.reload() // Recharge la page pour restaurer l'état React
  }

  const contributionOptions = [0, 100, 65, 50, 35]

  const { years: age_consolidation } = intervalToDuration({
    start: data?.general_info?.date_naissance,
    end: data?.general_info?.date_consolidation
  })

  return (
    <div id="content">
      <div id="top-menu">
        <button onClick={resetData}>Réinitialiser</button>
        <button onClick={printMain}>Imprimer</button>
      </div>

      <div id="main">
        <h1>Incapacités personnelles permanentes</h1>

        <table id="ipTable">
          <thead>
            <tr>
              <th>Âge consolidation</th>
              <th>Points</th>
              <th>%</th>
              <th>Total (€)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                <td>{age_consolidation}</td>
                <td>
                  <input
                    type="number"
                    value={row.pointsipp}
                    onChange={(e) => handleInputChange(index, 'pointsipp', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={row.pourcentageipp}
                    onChange={(e) => handleInputChange(index, 'pourcentageipp', e.target.value)}
                  />
                </td>
                <td>{(row.pointsipp * row.pourcentageipp).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h1>Incapacités ménagères permanentes</h1>

        <table id="ipTable">
          <thead>
            <tr>
              <th>Âge consolidation</th>
              <th>Points</th>
              <th>%</th>
              <th>Contribution (%)</th>
              <th>Total (€)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                <td>{age_consolidation}</td>
                <td>
                  <input
                    type="number"
                    value={row.pointsimp}
                    onChange={(e) => handleInputChange(index, 'pointsimp', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={row.pourcentageimp}
                    onChange={(e) => handleInputChange(index, 'pourcentageimp', e.target.value)}
                  />
                </td>
                <td>
                  <select
                    value={row.contribution || contributionOptions[0]}
                    onChange={(e) => handleInputChange(index, 'contribution', e.target.value)}
                  >
                    {contributionOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}%
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  {(row.pointsimp * row.pourcentageimp * (row.contribution / 100)).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <h1>Incapacités économiques permanentes</h1>

        <table id="ipTable">
          <thead>
            <tr>
              <th>Âge consolidation</th>
              <th>Points</th>
              <th>%</th>
              <th>Total (€)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                <td>{age_consolidation}</td>
                <td>
                  <input
                    type="number"
                    value={row.pointsiep}
                    onChange={(e) => handleInputChange(index, 'pointsiep', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={row.pourcentageiep}
                    onChange={(e) => handleInputChange(index, 'pourcentageiep', e.target.value)}
                  />
                </td>
                <td>{(row.pointsiep * row.pourcentageiep).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="total-box">
          <strong>Total : </strong> {getTotalSum()} €
        </div>
      </div>

      <div id="inv">
        <table>
          <tr>
            <td>0</td>
            <td>3660</td>
          </tr>
          <tr>
            <td>1</td>
            <td>3660</td>
          </tr>
          <tr>
            <td>2</td>
            <td>3660</td>
          </tr>
          <tr>
            <td>3</td>
            <td>3660</td>
          </tr>
          <tr>
            <td>4</td>
            <td>3660</td>
          </tr>
          <tr>
            <td>5</td>
            <td>3660</td>
          </tr>
          <tr>
            <td>6</td>
            <td>3660</td>
          </tr>
          <tr>
            <td>7</td>
            <td>3660</td>
          </tr>
          <tr>
            <td>8</td>
            <td>3660</td>
          </tr>
          <tr>
            <td>9</td>
            <td>3660</td>
          </tr>
          <tr>
            <td>10</td>
            <td>3660</td>
          </tr>
          <tr>
            <td>11</td>
            <td>3660</td>
          </tr>
          <tr>
            <td>12</td>
            <td>3660</td>
          </tr>
          <tr>
            <td>13</td>
            <td>3660</td>
          </tr>
          <tr>
            <td>14</td>
            <td>3660</td>
          </tr>
          <tr>
            <td>15</td>
            <td>3660</td>
          </tr>
          <tr>
            <td>16</td>
            <td>3600</td>
          </tr>
          <tr>
            <td>17</td>
            <td>3555</td>
          </tr>
          <tr>
            <td>18</td>
            <td>3510</td>
          </tr>
          <tr>
            <td>19</td>
            <td>3465</td>
          </tr>
          <tr>
            <td>20</td>
            <td>3420</td>
          </tr>
          <tr>
            <td>21</td>
            <td>3375</td>
          </tr>
          <tr>
            <td>22</td>
            <td>3330</td>
          </tr>
          <tr>
            <td>23</td>
            <td>3285</td>
          </tr>
          <tr>
            <td>24</td>
            <td>3240</td>
          </tr>
          <tr>
            <td>25</td>
            <td>3195</td>
          </tr>
          <tr>
            <td>26</td>
            <td>3150</td>
          </tr>
          <tr>
            <td>27</td>
            <td>3105</td>
          </tr>
          <tr>
            <td>28</td>
            <td>3060</td>
          </tr>
          <tr>
            <td>29</td>
            <td>3015</td>
          </tr>
          <tr>
            <td>30</td>
            <td>2970</td>
          </tr>
          <tr>
            <td>31</td>
            <td>2925</td>
          </tr>
          <tr>
            <td>32</td>
            <td>2880</td>
          </tr>
          <tr>
            <td>33</td>
            <td>2835</td>
          </tr>
          <tr>
            <td>34</td>
            <td>2790</td>
          </tr>
          <tr>
            <td>35</td>
            <td>2745</td>
          </tr>
          <tr>
            <td>36</td>
            <td>2700</td>
          </tr>
          <tr>
            <td>37</td>
            <td>2655</td>
          </tr>
          <tr>
            <td>38</td>
            <td>2610</td>
          </tr>
          <tr>
            <td>39</td>
            <td>2565</td>
          </tr>
          <tr>
            <td>40</td>
            <td>2520</td>
          </tr>
          <tr>
            <td>41</td>
            <td>2475</td>
          </tr>
          <tr>
            <td>42</td>
            <td>2430</td>
          </tr>
          <tr>
            <td>43</td>
            <td>2385</td>
          </tr>
          <tr>
            <td>44</td>
            <td>2340</td>
          </tr>
          <tr>
            <td>45</td>
            <td>2295</td>
          </tr>
          <tr>
            <td>46</td>
            <td>2250</td>
          </tr>
          <tr>
            <td>47</td>
            <td>2205</td>
          </tr>
          <tr>
            <td>48</td>
            <td>2160</td>
          </tr>
          <tr>
            <td>49</td>
            <td>2115</td>
          </tr>
          <tr>
            <td>50</td>
            <td>2070</td>
          </tr>
          <tr>
            <td>51</td>
            <td>2025</td>
          </tr>
          <tr>
            <td>52</td>
            <td>1980</td>
          </tr>
          <tr>
            <td>53</td>
            <td>1935</td>
          </tr>
          <tr>
            <td>54</td>
            <td>1890</td>
          </tr>
          <tr>
            <td>55</td>
            <td>1845</td>
          </tr>
          <tr>
            <td>56</td>
            <td>1800</td>
          </tr>
          <tr>
            <td>57</td>
            <td>1755</td>
          </tr>
          <tr>
            <td>58</td>
            <td>1710</td>
          </tr>
          <tr>
            <td>59</td>
            <td>1665</td>
          </tr>
          <tr>
            <td>60</td>
            <td>1620</td>
          </tr>
          <tr>
            <td>61</td>
            <td>1575</td>
          </tr>
          <tr>
            <td>62</td>
            <td>1530</td>
          </tr>
          <tr>
            <td>63</td>
            <td>1485</td>
          </tr>
          <tr>
            <td>64</td>
            <td>1440</td>
          </tr>
          <tr>
            <td>65</td>
            <td>1395</td>
          </tr>
          <tr>
            <td>66</td>
            <td>1350</td>
          </tr>
          <tr>
            <td>67</td>
            <td>1305</td>
          </tr>
          <tr>
            <td>68</td>
            <td>1260</td>
          </tr>
          <tr>
            <td>69</td>
            <td>1215</td>
          </tr>
          <tr>
            <td>70</td>
            <td>1170</td>
          </tr>
          <tr>
            <td>71</td>
            <td>1125</td>
          </tr>
          <tr>
            <td>72</td>
            <td>1080</td>
          </tr>
          <tr>
            <td>73</td>
            <td>1035</td>
          </tr>
          <tr>
            <td>74</td>
            <td>990</td>
          </tr>
          <tr>
            <td>75</td>
            <td>945</td>
          </tr>
          <tr>
            <td>76</td>
            <td>900</td>
          </tr>
          <tr>
            <td>77</td>
            <td>855</td>
          </tr>
          <tr>
            <td>78</td>
            <td>810</td>
          </tr>
          <tr>
            <td>79</td>
            <td>765</td>
          </tr>
          <tr>
            <td>80</td>
            <td>720</td>
          </tr>
          <tr>
            <td>81</td>
            <td>675</td>
          </tr>
          <tr>
            <td>82</td>
            <td>630</td>
          </tr>
          <tr>
            <td>83</td>
            <td>585</td>
          </tr>
          <tr>
            <td>84</td>
            <td>540</td>
          </tr>
          <tr>
            <td>85</td>
            <td>495</td>
          </tr>
          <tr>
            <td>86</td>
            <td>495</td>
          </tr>
          <tr>
            <td>87</td>
            <td>495</td>
          </tr>
          <tr>
            <td>88</td>
            <td>495</td>
          </tr>
          <tr>
            <td>89</td>
            <td>495</td>
          </tr>
          <tr>
            <td>90</td>
            <td>495</td>
          </tr>
          <tr>
            <td>91</td>
            <td>495</td>
          </tr>
          <tr>
            <td>92</td>
            <td>495</td>
          </tr>
          <tr>
            <td>93</td>
            <td>495</td>
          </tr>
          <tr>
            <td>94</td>
            <td>495</td>
          </tr>
          <tr>
            <td>95</td>
            <td>495</td>
          </tr>
          <tr>
            <td>96</td>
            <td>495</td>
          </tr>
          <tr>
            <td>97</td>
            <td>495</td>
          </tr>
          <tr>
            <td>98</td>
            <td>495</td>
          </tr>
          <tr>
            <td>99</td>
            <td>495</td>
          </tr>
          <tr>
            <td>100</td>
            <td>495</td>
          </tr>
        </table>
      </div>
    </div>
  )
}

export default ITP
