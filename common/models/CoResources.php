<?php

namespace common\models;

use Yii;

/**
 * This is the model class for table "co_resources".
 *
 * @property integer $resource_id
 * @property integer $parent_id
 * @property string $resource_name
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 *
 * @property CoRolesResources[] $coRolePermissions
 */
class CoResources extends \yii\db\ActiveRecord {

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'co_resources';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
            [['parent_id', 'created_by', 'modified_by'], 'integer'],
            [['resource_name'], 'required'],
            [['created_at', 'modified_at'], 'safe'],
            [['resource_name'], 'string', 'max' => 50]
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'resource_id' => 'Resource ID',
            'parent_id' => 'Parent ID',
            'resource_name' => 'Resource Name',
            'created_by' => 'Created By',
            'created_at' => 'Created At',
            'modified_by' => 'Modified By',
            'modified_at' => 'Modified At',
        ];
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getCoRolesResources() {
        return $this->hasMany(CoRolesResources::className(), ['resource_id' => 'resource_id']);
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getChild() {
        return $this->hasMany(self::className(), ['parent_id' => 'resource_id']);
    }

}
