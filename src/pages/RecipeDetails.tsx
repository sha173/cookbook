import {
  Box,
  Button,
  Grid,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import { EmptyRecipe, Recipe, TabItem } from "../constants/types";
import { useNavigate, useParams } from "react-router-dom";
import { Fragment, useEffect, useState } from "react";
import { pushTab, setCurrentTab } from "../redux/tabsList";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import EditIcon from "@mui/icons-material/Edit";
import ChecklistIcon from "@mui/icons-material/Checklist";
import { setSearchTags } from "../redux/searchTags";
import ChipDisplay from "../components/ChipDisplay";
import "../stylesheets/RecipeDetails.css";
import { RootState } from "../redux/store";
import { getRecipeDetails } from "../helpers";

const RecipeDetails = () => {
  const dispatch = useAppDispatch();
  const { id } = useParams();
  const [recipe, setRecipe] = useState<Recipe>(EmptyRecipe);
  const navigate = useNavigate();
  const { recipesList } = useAppSelector(
    (state: RootState) => state.recipesList
  );

  useEffect(() => {
    if (id !== undefined) {
      if (recipesList.length === 0) {
        getRecipeDetails(id, setRecipe);
      } else {
        setRecipe(
          recipesList.find((recipe) => recipe.key === id) ?? EmptyRecipe
        );
      }
    }
  }, [id]);

  useEffect(() => {
    if (recipe?.title !== "") {
      const newTab: TabItem = {
        label: recipe.title,
        link: `/view/${id}`,
      };
      dispatch(pushTab(newTab));
    }
  }, [recipe]);

  return (
    <Box className="containers">
      <Grid container rowSpacing={2}>
        <Grid item xs={12}>
          <div className="side-by-side-container">
            <div>
              <div className="h5">{recipe.title}</div>
              {recipe.url && <a href={recipe.url}>{recipe.url}</a>}
              <p>Servings: {recipe.servings}</p>
              <Typography
                variant="h6"
                sx={{ color: "var(--ThemeBlue) !important" }}
              >
                Ingredients
                <Tooltip
                  title="Add ingredients to grocery list"
                  sx={{
                    padding: 0,
                    "&:hover": { color: "var(--ThemeBlue)" },
                  }}
                >
                  <IconButton disableRipple>
                    <ChecklistIcon fontSize="large" />
                  </IconButton>
                </Tooltip>
              </Typography>
              <ul>
                {recipe?.ingredients.map((ing, index) =>
                  ing.unit ? (
                    <Fragment key={index}>
                      <li>
                        {ing.amount} {ing.unit} {ing.element}
                      </li>
                    </Fragment>
                  ) : (
                    <Typography variant="h6" marginLeft={"-30px"} key={index}>
                      {ing.element}
                    </Typography>
                  )
                )}
              </ul>
            </div>
            <Button variant="contained" onClick={() => navigate(`/add/${id}`)}>
              <EditIcon />
              &nbsp;Edit Recipe
            </Button>
          </div>
        </Grid>
        <Grid item xs={12}>
          <Typography
            variant="h6"
            sx={{ color: "var(--ThemeBlue) !important" }}
          >
            Steps
          </Typography>
          <ol>
            {recipe?.steps.map((step, index) =>
              step.stepNumber > 0 ? (
                <Fragment key={index}>
                  <li>
                    {step.stepNumber > 0 ?? null}
                    {step.text}
                  </li>
                </Fragment>
              ) : (
                <Typography variant="h6" marginLeft={"-30px"} key={index}>
                  {step.text}
                </Typography>
              )
            )}
          </ol>
        </Grid>
        <Grid item xs={12}>
          {recipe?.photo && (
            <img
              src={recipe?.photo}
              style={{ maxWidth: "100%", width: "400px" }}
              alt={recipe.title}
            />
          )}
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6">Tags</Typography>
          <ChipDisplay
            tags={recipe.tags}
            onChipClick={(tag) => {
              dispatch(setSearchTags([tag]));
              dispatch(setCurrentTab(0));
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default RecipeDetails;
