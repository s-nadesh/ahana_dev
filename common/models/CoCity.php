<?php

use common\models\CoState;
use common\models\GActiveRecord;
use yii\db\ActiveQuery;

namespace common\models;

/**
 * This is the model class for table "co_city".
 *
 * @property integer $city_id
 * @property integer $tenant_id
 * @property integer $state_id
 * @property string $city_name
 * @property string $status
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 * @property string $deleted_at
 *
 * @property CoState $state
 */
class CoCity extends GActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'co_city';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['tenant_id', 'state_id', 'created_by', 'modified_by'], 'integer'],
            [['state_id', 'city_name'], 'required'],
            [['status'], 'string'],
            [['created_at', 'modified_at', 'deleted_at'], 'safe'],
            [['city_name'], 'string', 'max' => 50],
            [['tenant_id', 'state_id', 'city_name', 'deleted_at'], 'unique', 'targetAttribute' => ['tenant_id', 'state_id', 'city_name', 'deleted_at'], 'message' => 'The combination of Tenant ID, State ID, City Name and Deleted At has already been taken.']
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'city_id' => 'City ID',
            'tenant_id' => 'Tenant ID',
            'state_id' => 'State',
            'city_name' => 'City Name',
            'status' => 'Status',
            'created_by' => 'Created By',
            'created_at' => 'Created At',
            'modified_by' => 'Modified By',
            'modified_at' => 'Modified At',
            'deleted_at' => 'Deleted At',
        ];
    }

    /**
     * @return ActiveQuery
     */
    public function getState()
    {
        return $this->hasOne(CoState::className(), ['state_id' => 'state_id']);
    }
}
