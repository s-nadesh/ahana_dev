<?php

namespace common\models;

use common\models\query\CoRolesResourcesQuery;
use Yii;
use yii\db\ActiveQuery;
use yii\db\ActiveRecord;

/**
 * This is the model class for table "co_roles_resources".
 *
 * @property integer $role_perm_id
 * @property integer $tenant_id
 * @property integer $role_id
 * @property integer $resource_id
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 * @property string $status
 *
 * @property CoResources $resource
 * @property CoRole $role
 * @property CoTenant $tenant
 */
class CoRolesResources extends ActiveRecord {

    public $resource_ids;

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'co_roles_resources';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
            [['tenant_id', 'role_id', 'resource_id'], 'required'],
            [['status'], 'string'],
            [['tenant_id', 'role_id', 'resource_id', 'created_by', 'modified_by'], 'integer'],
            [['created_at', 'modified_at', 'status'], 'safe']
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'role_perm_id' => 'Role Perm ID',
            'tenant_id' => 'Tenant ID',
            'role_id' => 'Role ID',
            'resource_id' => 'Resource ID',
            'created_by' => 'Created By',
            'created_at' => 'Created At',
            'modified_by' => 'Modified By',
            'modified_at' => 'Modified At',
        ];
    }

    /**
     * @return ActiveQuery
     */
    public function getResource() {
        return $this->hasOne(CoResources::className(), ['resource_id' => 'resource_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getRole() {
        return $this->hasOne(CoRole::className(), ['role_id' => 'role_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getTenant() {
        return $this->hasOne(CoTenant::className(), ['tenant_id' => 'tenant_id']);
    }

    // *** Used in some other functions ***
    public static function getModuleTree() {
        $tree = array();
        $parents = CoResources::find()->where(['parent_id' => null])->orderBy(['resource_name' => 'ASC'])->all();
        foreach ($parents as $key => $parent) {
            $tree[$key] = array('label' => $parent->resource_name, 'value' => $parent->resource_id);

            foreach ($parent->child as $cKey => $child) {
                $tree[$key]['children'][$cKey] = array('label' => $child->resource_name, 'value' => $child->resource_id);
                foreach ($child->child as $cKey2 => $child2) {
                    $tree[$key]['children'][$cKey]['children'][$cKey2] = array('label' => $child2->resource_name, 'value' => $child2->resource_id);
                    foreach ($child2->child as $cKey3 => $child3) {
                        $tree[$key]['children'][$cKey]['children'][$cKey2]['children'][$cKey3] = array('label' => $child3->resource_name, 'value' => $child3->resource_id);
                    }
                }
            }
        }
        return $tree;
    }

    public static function getModuletreeByRole($tenant_id, $role_id) {
        $tree = self::getModuleTree();
        $role_resources_ids = self::find()->select(['GROUP_CONCAT(resource_id) AS resource_ids'])->where(['role_id' => $role_id, 'tenant_id' => $tenant_id, 'status' => '1'])->one();
        $role_resources_ids = explode(',', $role_resources_ids->resource_ids);

        foreach ($tree as $key => $parent) {
            if (in_array($parent['value'], $role_resources_ids)) {
                $tot = $checked = $unchecked = 0;
                foreach ($parent['children'] as $cKey => $child) {
                    if (in_array($child['value'], $role_resources_ids)) {
                        $tree[$key]['children'][$cKey]['selected'] = true;
                        $checked++;
                    } else {
                        $unchecked++;
                    }
                    $tot++;

                    $tot2 = $checked2 = $unchecked2 = 0;

                    if (isset($child['children'])) {
                        foreach ($child['children'] as $cKey2 => $child2) {
                            if (in_array($child2['value'], $role_resources_ids)) {
                                $tree[$key]['children'][$cKey]['children'][$cKey2]['selected'] = true;
                                $checked2++;
                                $checked++;
                            } else {
                                $unchecked2++;
                                $unchecked++;
                            }
                            $tot++;
                            $tot2++;

                            $tot3 = $checked3 = $unchecked3 = 0;

                            if (isset($child2['children'])) {
                                foreach ($child2['children'] as $cKey3 => $child3) {
                                    if (in_array($child3['value'], $role_resources_ids)) {
                                        $tree[$key]['children'][$cKey]['children'][$cKey2]['children'][$cKey3]['selected'] = true;
                                        $checked3++;
                                        $checked2++;
                                        $checked++;
                                    } else {
                                        $unchecked3++;
                                        $unchecked2++;
                                        $unchecked++;
                                    }
                                    $tot++;
                                    $tot2++;
                                    $tot3++;
                                }

                                if ($tot3 == $checked3)
                                    $tree[$key]['children'][$cKey]['children'][$cKey2]['selected'] = true;
                                if ($checked3 > 0 && $unchecked3 > 0)
                                    $tree[$key]['children'][$cKey]['children'][$cKey2]['__ivhTreeviewIndeterminate'] = true;
                            }
                        }
                    }

                    if ($tot2 == $checked2)
                        $tree[$key]['children'][$cKey]['selected'] = true;
                    if ($checked2 > 0 && $unchecked2 > 0)
                        $tree[$key]['children'][$cKey]['__ivhTreeviewIndeterminate'] = true;
                }

                if ($tot == $checked)
                    $tree[$key]['selected'] = true;
                if ($checked > 0 && $unchecked > 0)
                    $tree[$key]['__ivhTreeviewIndeterminate'] = true;
            }
        }
        return $tree;
    }

    public static function getModuleTreeByResourcename($resource_name) {
        $tree = array();
        $parents = CoResources::find()->where(['resource_name' => $resource_name])->one();
        $tree[0] = array('label' => $parents->resource_name, 'value' => $parents->resource_id, 'url' => $parents->resource_url);
        foreach ($parents->child as $cKey => $child) {
            $tree[0]['children'][$cKey] = array('label' => $child->resource_name, 'value' => $child->resource_id, 'url' => $child->resource_url);
            foreach ($child->child as $cKey2 => $child2) {
                $tree[0]['children'][$cKey]['children'][$cKey2] = array('label' => $child2->resource_name, 'value' => $child2->resource_id, 'url' => $child2->resource_url);
            }
        }
        return $tree;
    }

    //Get Particular organization accessed modules tree
    public static function getOrgModuletree($tenant_id, $super_roler_id) {
        $tree = self::getModuleTree();
        $role_resources_ids = self::find()->select(['GROUP_CONCAT(resource_id) AS resource_ids'])->where(['role_id' => $super_roler_id, 'tenant_id' => $tenant_id, 'status' => '1'])->one();
        $role_resources_ids = explode(',', $role_resources_ids->resource_ids);

        foreach ($tree as $key => $menu) {
            if (in_array($menu['value'], $role_resources_ids)) {
                if (isset($menu['children'])) {
                    foreach ($menu['children'] as $ckey => $child) {
                        if (in_array($child['value'], $role_resources_ids)) {
                            if (isset($child['children'])) {
                                foreach ($child['children'] as $ckey2 => $child2) {
                                    if (!in_array($child2['value'], $role_resources_ids)) {
                                        unset($tree[$key]['children'][$ckey]['children'][$ckey2]);
                                    }
                                }
                                $tree[$key]['children'][$ckey]['children'] = array_values($tree[$key]['children'][$ckey]['children']);
                            }
                        } else {
                            unset($tree[$key]['children'][$ckey]);
                        }
                    }
                    $tree[$key]['children'] = array_values($tree[$key]['children']);
                }
            } else {
                unset($tree[$key]);
            }
        }
        $tree = array_values($tree);

        return $tree;
    }

    public static function fix_keys($array) {
        foreach ($array as $k => $val) {
            if (is_array($val))
                $array[$k] = self::fix_keys($val); //recurse
        }
        return array_values($array);
    }

    //Get Particular organization accessed modules tree with role wise
    public static function getOrgModuletreeByRole($tenant_id, $tenant_super_role_id, $role_id, $resource_tenant_id) {
        $tree = self::getOrgModuletree($tenant_id, $tenant_super_role_id);
        
        $role_resources_ids = self::find()->select(['GROUP_CONCAT(resource_id) AS resource_ids'])->where(['role_id' => $role_id, 'tenant_id' => $resource_tenant_id, 'status' => '1'])->one();
        $role_resources_ids = explode(',', $role_resources_ids->resource_ids);

        foreach ($tree as $key => $parent) {
            if (in_array($parent['value'], $role_resources_ids)) {
                $tot = $checked = $unchecked = 0;
                foreach ($parent['children'] as $cKey => $child) {
                    if (in_array($child['value'], $role_resources_ids)) {
                        $tree[$key]['children'][$cKey]['selected'] = true;
                        $checked++;
                    } else {
                        $unchecked++;
                    }
                    $tot++;

                    $tot2 = $checked2 = $unchecked2 = 0;

                    if (isset($child['children'])) {
                        foreach ($child['children'] as $cKey2 => $child2) {
                            if (isset($child2['value']) && in_array($child2['value'], $role_resources_ids)) {
                                $tree[$key]['children'][$cKey]['children'][$cKey2]['selected'] = true;
                                $checked2++;
                                $checked++;
                                
                                /****/
                                $tot3 = $checked3 = $unchecked3 = 0;

                                if (isset($child2['children'])) {
                                    foreach ($child2['children'] as $cKey3 => $child3) {
                                        if (isset($child3['value']) && in_array($child3['value'], $role_resources_ids)) {
                                            $tree[$key]['children'][$cKey]['children'][$cKey2]['children'][$cKey3]['selected'] = true;
                                            $checked3++;
                                            $checked++;
                                        } else {
                                            $unchecked3++;
                                            $unchecked++;
                                        }
                                        $tot++;
                                        $tot2++;
                                        $tot3++;
                                    }
                                }

                                if ($tot3 == $checked3)
                                    $tree[$key]['children'][$cKey]['selected'] = true;
                                if ($checked3 > 0 && $unchecked3 > 0)
                                    $tree[$key]['children'][$cKey]['childern'][$cKey2]['__ivhTreeviewIndeterminate'] = true;
                                /****/
                                
                            } else {
                                $unchecked2++;
                                $unchecked++;
                            }
                            $tot++;
                            $tot2++;
                        }
                    }

                    if ($checked2 > 0 && $tot2 == $checked2)
                        $tree[$key]['children'][$cKey]['selected'] = true;
                    if ($checked2 > 0 && $unchecked2 > 0)
                        $tree[$key]['children'][$cKey]['__ivhTreeviewIndeterminate'] = true;
                }

                if ($tot == $checked)
                    $tree[$key]['selected'] = true;
                if ($checked > 0 && $unchecked > 0)
                    $tree[$key]['__ivhTreeviewIndeterminate'] = true;
            }
        }
        return $tree;
    }

    public static function find() {
        return new CoRolesResourcesQuery(get_called_class());
    }

    public function fields() {
        return [
            'role_perm_id',
            'tenant_id',
            'role_id',
            'resource_id',
            'status',
            'created_by',
            'created_at',
            'modified_by',
            'modified_at',
            'resource_name' => function ($model) {
                return (isset($model->resource) ? $model->resource->resource_name : '-');
            },
        ];
    }

    public static function getDb() {
        return Yii::$app->client;
    }

}
